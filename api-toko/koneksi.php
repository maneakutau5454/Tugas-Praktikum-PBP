<?php
// Catatan: header CORS & Content-Type diatur di masing-masing endpoint
// agar bisa dikustomisasi per-method (GET/POST/OPTIONS).

// Deklarasi parameter koneksi
$host = "localhost";
$user = "root";
$pass = ""; // Kosongkan jika XAMPP bawaan
$db   = "db_toko";

// Membuka jembatan koneksi
$koneksi = mysqli_connect($host, $user, $pass, $db);

// Cek jika koneksi gagal
if (!$koneksi) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi Database Gagal!"]));
}
?>