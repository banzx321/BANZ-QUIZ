# BANZ QUIZ — Vercel + Supabase Free

Versi ini TIDAK menggunakan Firebase.

Arsitektur:
- Vercel = hosting website
- Supabase Free = database PostgreSQL + login admin
- Siswa = tidak perlu login
- Admin = login melalui Supabase Auth
- Soal admin = tersimpan online dan dibaca semua pengguna

## 1. Buat project Supabase
Buka https://supabase.com/dashboard/
Buat project baru.

## 2. Buat database
Buka SQL Editor.
Paste isi file `supabase.sql`.
Klik Run.

## 3. Buat akun admin
Masuk:
Authentication > Users > Add user
Buat email dan password admin.

## 4. Ambil URL dan Publishable Key
Masuk ke Project Settings > API.
Ambil:
- Project URL
- Publishable key (atau anon key pada project lama)

JANGAN gunakan service_role key di website.

## 5. Isi script.js
Ganti:
const SUPABASE_URL = "GANTI_DENGAN_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "GANTI_DENGAN_PUBLISHABLE_KEY";

dengan nilai milik project Supabase.

## 6. Upload ke Vercel
Upload folder ini ke GitHub lalu import repository tersebut ke Vercel,
atau gunakan metode deploy Vercel yang biasa kamu pakai.

## 7. Tambahkan loading video (opsional)
Buat:
video/loading.mp4

Kalau file video tidak ada, halaman tetap lanjut otomatis setelah 5 detik.

## Catatan keamanan
Publishable/anon key boleh digunakan di browser jika Row Level Security (RLS)
dan policy database sudah benar. Jangan pernah menaruh service_role key di
script.js atau frontend.

Untuk versi ini, setiap user yang berhasil login ke Supabase Auth dapat
mengubah soal. Jika hanya satu akun admin yang akan digunakan, jangan berikan
akun tersebut ke pengguna lain.
