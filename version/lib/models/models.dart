class Entry {
  final String id;
  final String profileId;
  final String title;
  final String encryptedData;
  final String iv;
  final String salt;
  final String category;
  final bool pinned;
  final int createdAt;
  final int? version;

  Entry({
    required this.id,
    required this.profileId,
    required this.title,
    required this.encryptedData,
    required this.iv,
    required this.salt,
    required this.category,
    required this.pinned,
    required this.createdAt,
    this.version,
  });

  factory Entry.fromJson(Map<String, dynamic> json) {
    return Entry(
      id: json['id'],
      profileId: json['profile_id'] ?? '',
      title: json['title'],
      encryptedData: json['encrypted_data'],
      iv: json['iv'],
      salt: json['salt'],
      category: json['category'],
      pinned: json['pinned'] == 1 || json['pinned'] == true,
      createdAt: json['created_at'],
      version: json['version'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'profile_id': profileId,
      'title': title,
      'encrypted_data': encryptedData,
      'iv': iv,
      'salt': salt,
      'category': category,
      'pinned': pinned ? 1 : 0,
      'created_at': createdAt,
      'version': version,
    };
  }
}

class Profile {
  final String id;
  final String name;
  final int createdAt;

  Profile({required this.id, required this.name, required this.createdAt});

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'],
      name: json['name'],
      createdAt: json['created_at'],
    );
  }
}
