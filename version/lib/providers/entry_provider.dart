import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class EntryProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Entry> _entries = [];
  Map<String, Profile> _profiles = {};
  bool _isLoading = false;
  String? _error;

  List<Entry> get entries => _entries;
  Map<String, Profile> get profiles => _profiles;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchEntries({
    String? profileId,
    String? category,
    bool? pinned,
    String? search,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _apiService.getEntries(
        profileId: profileId,
        category: category,
        pinned: pinned,
        search: search,
      );

      _entries = result['entries'] as List<Entry>;
      _profiles = result['profiles'] as Map<String, Profile>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> togglePin(String entryId) async {
    try {
      await _apiService.togglePin(entryId);
      // Refresh entries to show new state
      await fetchEntries();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
