export interface Entry {
  id: string;
  title: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  pinned: number;
  profile_id: string;
  category: 'mnemonic_phrase' | 'private_key' | 'password' | 'other';
  version?: number; // Encryption version: 2 = AES-GCM, undefined/1 = legacy AES-CBC
  created_at: number;
  updated_at: number;
}

export interface Profile {
  id: string;
  name: string;
  user_id?: string;
  created_at?: number;
  updated_at?: number;
} 