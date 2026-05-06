<?php
// ── CORS Headers — wajib ada SEBELUM include apapun ─────────
// Izinkan akses dari semua origin (dev mode)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request dari browser
// Browser selalu kirim OPTIONS dulu sebelum POST dengan Content-Type: application/json
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); // Jawab OK, selesai. Jangan lanjut ke bawah.
}

// ── Koneksi Database ─────────────────────────────────────────
include "koneksi.php";

// ── Terima JSON dari JavaScript Fetch ────────────────────────
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// ── Validasi Data ─────────────────────────────────────────────
if (isset($data['nama_barang']) && isset($data['harga']) && isset($data['stok'])) {

    // Escape untuk mencegah SQL Injection dasar
    $nama  = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $data['harga']);
    $stok  = mysqli_real_escape_string($koneksi, $data['stok']);

    // ✅ Query INSERT — sekarang menyimpan stok juga!
    $query = "INSERT INTO barang (nama_barang, harga, stok) VALUES ('$nama', '$harga', '$stok')";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Data barang berhasil disimpan!"]);
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan ke database: " . mysqli_error($koneksi)]);
    }

} else {
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap! Kirim: nama_barang, harga, stok."]);
}
?>