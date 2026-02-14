import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/entry_provider.dart';
import '../../widgets/entry_card.dart';
import '../../widgets/entry_reveal_modal.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EntryProvider>().fetchEntries();

      // Listen for session warnings
      final authProvider = context.read<AuthProvider>();
      authProvider.sessionWarning.listen((minutesRemaining) {
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Session Expiring'),
              content: Text(
                'Your session will expire in $minutesRemaining minutes due to inactivity.',
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    context.read<AuthProvider>().resetSessionTimer();
                    Navigator.of(context).pop();
                  },
                  child: const Text('I\'m still here'),
                ),
              ],
            ),
          );
        }
      });
    });
  }

  void _showRevealModal(BuildContext context, var entry) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => EntryRevealModal(entry: entry),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<EntryProvider>().fetchEntries(),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: Consumer<EntryProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error: ${provider.error}',
                    style: const TextStyle(color: Colors.red),
                  ),
                  ElevatedButton(
                    onPressed: () => provider.fetchEntries(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (provider.entries.isEmpty) {
            return const Center(child: Text('No entries found. Create one!'));
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount:
                  2, // 2 columns for tablet feel, or use responsive layout builder
              childAspectRatio: 0.75, // Adjust based on card height
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: provider.entries.length,
            itemBuilder: (context, index) {
              final entry = provider.entries[index];
              return EntryCard(
                entry: entry,
                profile: provider.profiles[entry.profileId],
                onTap: () {
                  context.push('/entries/edit/${entry.id}');
                },
                onReveal: () => _showRevealModal(context, entry),
                onPin: () => provider.togglePin(entry.id),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/entries/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
