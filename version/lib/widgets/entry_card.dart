import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';

class EntryCard extends StatelessWidget {
  final Entry entry;
  final Profile? profile;
  final VoidCallback onTap;
  final VoidCallback onReveal;
  final VoidCallback onPin;

  const EntryCard({
    super.key,
    required this.entry,
    this.profile,
    required this.onTap,
    required this.onReveal,
    required this.onPin,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM d');

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCategoryIcon(entry.category),
                  IconButton(
                    icon: Icon(
                      entry.pinned ? Icons.star : Icons.star_border,
                      color: entry.pinned ? Colors.amber : Colors.grey,
                    ),
                    onPressed: onPin,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                entry.title,
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (profile != null)
                Text(
                  profile!.name,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCategoryBadge(entry.category),
                  Text(
                    dateFormat.format(
                      DateTime.fromMillisecondsSinceEpoch(
                        entry.createdAt * 1000,
                      ),
                    ),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onReveal,
                  icon: const Icon(Icons.visibility, size: 16),
                  label: const Text('Reveal'),
                  style: ElevatedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryIcon(String category) {
    IconData icon;
    Color color;
    Color bg;

    switch (category) {
      case 'mnemonic_phrase':
        icon = Icons.description;
        color = Colors.blue;
        bg = Colors.blue.shade50;
        break;
      case 'private_key':
        icon = Icons.vpn_key;
        color = Colors.purple;
        bg = Colors.purple.shade50;
        break;
      case 'password':
        icon = Icons.lock;
        color = Colors.green; // Emerald equivalent
        bg = Colors.green.shade50;
        break;
      default:
        icon = Icons.security;
        color = Colors.grey;
        bg = Colors.grey.shade50;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  Widget _buildCategoryBadge(String category) {
    String label;
    Color color;
    Color bg;

    switch (category) {
      case 'mnemonic_phrase':
        label = 'Seed Phrase';
        color = Colors.blue[800]!;
        bg = Colors.blue[100]!;
        break;
      case 'private_key':
        label = 'Private Key';
        color = Colors.purple[800]!;
        bg = Colors.purple[100]!;
        break;
      case 'password':
        label = 'Password';
        color = Colors.green[800]!;
        bg = Colors.green[100]!;
        break;
      default:
        label = 'Other';
        color = Colors.grey[800]!;
        bg = Colors.grey[200]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
