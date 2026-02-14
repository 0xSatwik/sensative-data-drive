import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/entry_provider.dart';
import '../../services/crypto_service.dart';
import '../../services/api_service.dart';

class CreateEditEntryScreen extends StatefulWidget {
  final String? id; // If null, creating new entry

  const CreateEditEntryScreen({super.key, this.id});

  @override
  State<CreateEditEntryScreen> createState() => _CreateEditEntryScreenState();
}

class _CreateEditEntryScreenState extends State<CreateEditEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _dataController = TextEditingController();
  final _passwordController = TextEditingController();

  String _selectedCategory = 'password';
  String? _selectedProfileId;
  bool _isEncrypting = false;

  @override
  void initState() {
    super.initState();
    // In a real app, if editing, we'd fetch the entry details here or pass them in arguments
    // For now, let's assume creation or basic edit placeholder
    if (widget.id != null) {
      // Find the entry from provider to pre-fill
      final entry = context.read<EntryProvider>().entries.firstWhere(
        (e) => e.id == widget.id,
        orElse: () => throw Exception('Entry not found'),
      );
      _titleController.text = entry.title;
      _selectedCategory = entry.category;
      _selectedProfileId = entry.profileId;
      // We can't pre-fill data/password as it's encrypted
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _dataController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isEncrypting = true);

      try {
        // Enforce strong password for encryption?
        // Web app does: isPasswordStrongEnough(password)
        final strength = CryptoService.checkPasswordStrength(
          _passwordController.text,
        );
        if ((strength['score'] as int) < 3) {
          throw Exception(
            'Encryption password is too weak. Must be at least "Good".',
          );
        }

        // Encrypt data
        final encryptionResult = await CryptoService.encryptData(
          _dataController.text,
          _passwordController.text,
        );

        final entryData = {
          'title': _titleController.text,
          'category': _selectedCategory,
          'profile_id':
              _selectedProfileId ?? '', // Handle empty/default profile
          'encrypted_data': encryptionResult['encryptedData'],
          'iv': encryptionResult['iv'],
          'salt': encryptionResult['salt'],
          'version': encryptionResult['version'],
        };

        if (widget.id == null) {
          // Create
          await ApiService().createEntry(
            entryData,
          ); // Should use Provider ideally
        } else {
          // Update
          await ApiService().updateEntry(widget.id!, entryData);
        }

        // Refresh list
        if (mounted) {
          await context.read<EntryProvider>().fetchEntries();
          if (mounted) context.pop();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
        }
      } finally {
        if (mounted) {
          setState(() => _isEncrypting = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profiles = context.watch<EntryProvider>().profiles;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.id == null ? 'New Entry' : 'Edit Entry'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                // ignore: deprecated_member_use
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                items: const [
                  DropdownMenuItem(value: 'password', child: Text('Password')),
                  DropdownMenuItem(
                    value: 'private_key',
                    child: Text('Private Key'),
                  ),
                  DropdownMenuItem(
                    value: 'mnemonic_phrase',
                    child: Text('Seed Phrase'),
                  ),
                  DropdownMenuItem(value: 'other', child: Text('Other')),
                ],
                onChanged: (v) => setState(() => _selectedCategory = v!),
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                // ignore: deprecated_member_use
                value: profiles.containsKey(_selectedProfileId)
                    ? _selectedProfileId
                    : null,
                decoration: const InputDecoration(
                  labelText: 'Profile (Optional)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('None')),
                  ...profiles.values.map(
                    (p) => DropdownMenuItem(value: p.id, child: Text(p.name)),
                  ),
                ],
                onChanged: (v) => setState(() => _selectedProfileId = v),
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _dataController,
                decoration: const InputDecoration(
                  labelText: 'Data to Encrypt',
                  border: OutlineInputBorder(),
                  helperText: 'This will be encrypted locally before sending.',
                  prefixIcon: Icon(Icons.security),
                ),
                maxLines: 4,
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Encryption Password',
                  border: OutlineInputBorder(),
                  helperText: 'Unrecoverable if lost! Must be strong.',
                  prefixIcon: Icon(Icons.vpn_key),
                ),
                obscureText: true,
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isEncrypting ? null : _save,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                ),
                child: _isEncrypting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        widget.id == null
                            ? 'Encrypt & Save'
                            : 'Encrypt & Update',
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
