import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';
import '../services/crypto_service.dart';

class EntryRevealModal extends StatefulWidget {
  final Entry entry;

  const EntryRevealModal({super.key, required this.entry});

  @override
  State<EntryRevealModal> createState() => _EntryRevealModalState();
}

class _EntryRevealModalState extends State<EntryRevealModal> {
  final _passwordController = TextEditingController();
  bool _isDecrypting = false;
  String? _decryptedData;
  String? _error;
  bool _showPassword = false;

  // Timer related
  Timer? _autoHideTimer;
  Timer? _clipboardTimer;
  int _countdown = 60;
  Timer? _countdownTimer;

  @override
  void dispose() {
    _passwordController.dispose();
    _autoHideTimer?.cancel();
    _clipboardTimer?.cancel();
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _decrypt() async {
    setState(() {
      _isDecrypting = true;
      _error = null;
    });

    try {
      final decrypted = await CryptoService.decryptData(
        widget.entry.encryptedData,
        _passwordController.text,
        widget.entry.iv,
        widget.entry.salt,
      );

      setState(() {
        _decryptedData = decrypted;
        _isDecrypting = false;
        _startTimers();
      });
    } catch (e) {
      setState(() {
        _error = 'Incorrect password. Please try again.';
        _isDecrypting = false;
      });
    }
  }

  void _startTimers() {
    _countdown = 60;
    _autoHideTimer?.cancel();
    _countdownTimer?.cancel();

    _autoHideTimer = Timer(const Duration(seconds: 60), () {
      if (mounted) {
        Navigator.of(context).pop(); // Close modal
      }
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _countdown--;
        });
      }
    });
  }

  Future<void> _copyToClipboard(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Copied to clipboard! Clears in 30s.')),
      );
    }

    _clipboardTimer?.cancel();
    _clipboardTimer = Timer(const Duration(seconds: 30), () {
      Clipboard.setData(const ClipboardData(text: ''));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Reveal ${widget.entry.title}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_decryptedData == null) ...[
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Enter Password to Decrypt',
                border: const OutlineInputBorder(),
                errorText: _error,
                suffixIcon: IconButton(
                  icon: Icon(
                    _showPassword ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: () =>
                      setState(() => _showPassword = !_showPassword),
                ),
              ),
              obscureText: !_showPassword,
              onSubmitted: (_) => _decrypt(),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isDecrypting ? null : _decrypt,
              child: _isDecrypting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Decrypt'),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Row(
                children: [
                  const Icon(Icons.timer, size: 16, color: Colors.amber),
                  const SizedBox(width: 8),
                  Text(
                    'Auto-hiding in $_countdown s',
                    style: TextStyle(color: Colors.amber.shade900),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Decrypted Data:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: SelectableText(
                _decryptedData!,
                style: const TextStyle(fontFamily: 'Courier'),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _copyToClipboard(_decryptedData!),
              icon: const Icon(Icons.copy),
              label: const Text('Copy to Clipboard'),
            ),
          ],
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
