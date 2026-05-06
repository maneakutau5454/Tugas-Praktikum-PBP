<?php
// Catatan: header CORS & Content-Type diatur di masing-masing endpoint
// agar bisa dikustomisasi per-method (GET/POST/OPTIONS).

// Deklarasi parameter koneksi
$host = "sql305.infinityfree.com";
$user = "if0_41842756";
$pass = "janganlupa567"; 
$db   = "if0_41842756_db_toko";

// Membuka jembatan koneksi
$koneksi = mysqli_connect($host, $user, $pass, $db);

// Cek jika koneksi gagal
if (!$koneksi) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi Database Gagal!"]));
}
?>