import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';

class ApiService {
  static const String _baseUrl = 'https://crypto-vault-api.memonic.workers.dev';
  final Dio _dio = Dio(
    BaseOptions(baseUrl: _baseUrl, contentType: 'application/json'),
  );
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  final _authStreamController = StreamController<void>.broadcast();
  Stream<void> get onUnauthorized => _authStreamController.stream;

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            await _storage.delete(key: 'token');
            _authStreamController.add(null);
          }
          return handler.next(e);
        },
      ),
    );
  }

  void dispose() {
    _authStreamController.close();
  }

  // --- Auth ---

  Future<void> register(String email, String password) async {
    await _dio.post(
      '/api/register',
      data: {'email': email, 'password': password},
    );
  }

  Future<String> login(String email, String password) async {
    final response = await _dio.post(
      '/api/login',
      data: {'email': email, 'password': password},
    );
    final token = response.data['token'];
    await _storage.write(key: 'token', value: token);
    return token;
  }

  Future<void> logout() async {
    try {
      await _dio.post('/api/logout');
    } catch (_) {
      // Ignore errors on logout
    } finally {
      await _storage.delete(key: 'token');
    }
  }

  // --- Entries ---

  Future<Map<String, dynamic>> getEntries({
    String? profileId,
    String? category,
    bool? pinned,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{};
    if (profileId != null) queryParams['profile_id'] = profileId;
    if (category != null) queryParams['category'] = category;
    if (pinned != null) queryParams['pinned'] = pinned ? '1' : '0';
    if (search != null) queryParams['search'] = search;

    final response = await _dio.get(
      '/api/entries',
      queryParameters: queryParams,
    );

    // Parse entries
    final entries = (response.data['entries'] as List)
        .map((e) => Entry.fromJson(e))
        .toList();

    // Parse profiles
    final profiles = <String, Profile>{};
    if (response.data['profiles'] != null) {
      (response.data['profiles'] as Map<String, dynamic>).forEach((key, value) {
        profiles[key] = Profile.fromJson(value);
      });
    }

    return {'entries': entries, 'profiles': profiles};
  }

  Future<void> createEntry(Map<String, dynamic> data) async {
    await _dio.post('/api/entries', data: data);
  }

  Future<void> updateEntry(String id, Map<String, dynamic> data) async {
    await _dio.put('/api/entries/$id', data: data);
  }

  Future<void> deleteEntry(String id) async {
    await _dio.delete('/api/entries/$id');
  }

  Future<void> togglePin(String id) async {
    await _dio.put('/api/entries/$id/pin');
  }
}
