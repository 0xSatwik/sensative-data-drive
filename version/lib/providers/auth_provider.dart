import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  bool _isAuthenticated = false;
  bool _isLoading = true;
  Timer? _sessionTimer;
  Timer? _warningTimer;

  // Session timeout settings
  static const int _timeoutMinutes = 15;
  static const int _warningMinutes = 2;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  // Stream for session warnings (int minutesRemaining)
  final _sessionWarningController = StreamController<int>.broadcast();
  Stream<int> get sessionWarning => _sessionWarningController.stream;

  AuthProvider() {
    _init();
    _apiService.onUnauthorized.listen((_) {
      logout();
    });
  }

  Future<void> _init() async {
    final token = await _storage.read(key: 'token');
    if (token != null) {
      _isAuthenticated = true;
      _startSessionTimer();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _apiService.login(email, password);
      _isAuthenticated = true;
      _startSessionTimer();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _apiService.register(email, password);
      // Auto login after register? Or require login?
      // Current web app flow requires login after register usually.
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _cancelTimers();
    await _apiService.logout();
    _isAuthenticated = false;
    notifyListeners();
  }

  // --- Session Management ---

  void _startSessionTimer() {
    _cancelTimers();

    // Warning timer
    _warningTimer = Timer(
      const Duration(minutes: _timeoutMinutes - _warningMinutes),
      () {
        if (kDebugMode) {
          print('Session warning: $_warningMinutes minutes remaining');
        }
        _sessionWarningController.add(_warningMinutes);
      },
    );

    // Logout timer
    _sessionTimer = Timer(const Duration(minutes: _timeoutMinutes), () {
      logout();
    });
  }

  void resetSessionTimer() {
    if (_isAuthenticated) {
      _startSessionTimer();
    }
  }

  void _cancelTimers() {
    _sessionTimer?.cancel();
    _warningTimer?.cancel();
  }

  @override
  void dispose() {
    _cancelTimers();
    _sessionWarningController.close();
    // _apiService.dispose(); // ApiService is created inside, but listen subscription should be cancelled.
    // Ideally ApiService should be injected or singleton.
    // For now, simpler to just let it be as AuthProvider is likely a singleton or scoped to app.
    super.dispose();
  }
}
