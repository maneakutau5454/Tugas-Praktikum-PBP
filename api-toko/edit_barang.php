<?php
// ── CORS Headers ─────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Koneksi Database ─────────────────────────────────────────
include "koneksi.php";

// ── Terima JSON dari Fetch ───────────────────────────────
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// ── Validasi Data ─────────────────────────────────────────────
if (isset($data['id']) && isset($data['nama_barang']) && isset($data['harga']) && isset($data['stok'])) {
    
    $id    = mysqli_real_escape_string($koneksi, $data['id']);
    $nama  = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $data['harga']);
    $stok  = mysqli_real_escape_string($koneksi, $data['stok']);

    // ✅ Query UPDATE
    $query = "UPDATE barang SET 
                nama_barang = '$nama', 
                harga = '$harga', 
                stok = '$stok' 
              WHERE id = '$id'";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Data barang berhasil diperbarui!"]);
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal memperbarui data: " . mysqli_error($koneksi)]);
    }

} else {
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap!"]);
}
?>
