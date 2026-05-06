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
if (isset($data['id'])) {
    $id = mysqli_real_escape_string($koneksi, $data['id']);

    // ✅ Query DELETE
    $query = "DELETE FROM barang WHERE id = '$id'";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Barang berhasil dihapus!"]);
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal menghapus data: " . mysqli_error($koneksi)]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "ID tidak ditemukan!"]);
}
?>
