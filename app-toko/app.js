// ============================================================
//  app.js — Inventory Manager
//  Fetch data barang dari PHP API, render ke tabel HTML
// ============================================================

const API_URL = 'http://localhost/PBPv2/api-toko/get_barang.php';

// Cache data agar filter bisa bekerja tanpa fetch ulang
let cachedData = [];

// ── Helpers ─────────────────────────────────────────────────

/** Format angka ke Rupiah, contoh: 15000 → "Rp 15.000" */
function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

/** Format angka besar ringkas untuk stat card */
function formatAngkaRingkas(angka) {
    if (angka >= 1_000_000) return (angka / 1_000_000).toFixed(1) + ' jt';
    if (angka >= 1_000)     return (angka / 1_000).toFixed(1) + ' rb';
    return String(angka);
}

/**
 * Tentukan badge stok berdasarkan jumlah.
 * Returns HTML string <span> siap pakai.
 */
function badgeStok(stok) {
    const n = Number(stok);
    if (n === 0)   return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Habis</span>`;
    if (n <= 5)    return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Kritis</span>`;
    if (n <= 20)   return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Rendah</span>`;
    return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Aman</span>`;
}

// ── Render ───────────────────────────────────────────────────

/** Render array data ke dalam tbody */
function renderTabel(data) {
    const tbody = document.getElementById('tabel-barang');

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-14 text-center text-white/30 text-sm">
                    😕 Tidak ada data yang cocok.
                </td>
            </tr>`;
        document.getElementById('row-count').textContent = '0 barang ditemukan';
        return;
    }

    let barisHTML = '';
    data.forEach((barang, index) => {
        const stokDisplay = Number(barang.stok) === 0
            ? `<span class="text-red-400 font-semibold">0</span>`
            : `<span class="font-medium">${barang.stok}</span>`;

        barisHTML += `
            <tr class="border-b border-white/5 animate-fade-in" style="animation-delay: ${index * 40}ms">
                <td class="px-6 py-4 text-white/30 font-mono text-xs">${barang.id}</td>
                <td class="px-6 py-4 font-medium text-white/90">${barang.nama_barang}</td>
                <td class="px-6 py-4 text-right text-amber-300 font-semibold tabular-nums">${formatRupiah(barang.harga)}</td>
                <td class="px-6 py-4 text-center tabular-nums">${stokDisplay}</td>
                <td class="px-6 py-4 text-center">${badgeStok(barang.stok)}</td>
            </tr>`;
    });

    tbody.innerHTML = barisHTML;

    // Update row counter
    document.getElementById('row-count').textContent =
        `Menampilkan ${data.length} dari ${cachedData.length} barang`;
}

/** Hitung & tampilkan stat cards dari full dataset */
function updateStats(data) {
    const totalBarang = data.length;
    const totalStok   = data.reduce((sum, b) => sum + Number(b.stok), 0);
    const totalNilai  = data.reduce((sum, b) => sum + (Number(b.harga) * Number(b.stok)), 0);

    document.getElementById('stat-total').textContent = totalBarang;
    document.getElementById('stat-stok').textContent  = totalStok.toLocaleString('id-ID');
    document.getElementById('stat-nilai').textContent = formatAngkaRingkas(totalNilai);
}

// ── Filter ───────────────────────────────────────────────────

/** Filter tabel berdasarkan input search — tanpa fetch ulang */
function filterTable() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();
    const filtered = cachedData.filter(b =>
        b.nama_barang.toLowerCase().includes(keyword)
    );
    renderTabel(filtered);
}

// ── Fetch ────────────────────────────────────────────────────

/** Ambil data dari PHP API & tampilkan ke tabel */
async function ambilDataBarang() {
    const tbody = document.getElementById('tabel-barang');

    // Tampilkan loading spinner
    tbody.innerHTML = `
        <tr id="loading-row">
            <td colspan="5" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="spinner"></div>
                    <span class="text-white/40 text-sm">Mengambil data dari server…</span>
                </div>
            </td>
        </tr>`;

    document.getElementById('row-count').textContent = 'Memuat…';

    try {
        // 1. Panggil API endpoint PHP
        const response = await fetch(API_URL);

        // 2. Pastikan response OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 3. Parse JSON
        const hasil = await response.json();

        if (hasil.status === 'success') {
            cachedData = hasil.data;      // simpan ke cache
            updateStats(cachedData);      // isi stat cards
            renderTabel(cachedData);      // isi tabel
        } else {
            throw new Error(hasil.message || 'Respons API tidak valid.');
        }

    } catch (error) {
        console.error('❌ Gagal mengambil data:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-14 text-center">
                    <div class="flex flex-col items-center gap-2 text-red-400">
                        <span class="text-3xl">⚠️</span>
                        <p class="font-semibold">Gagal terhubung ke server</p>
                        <p class="text-xs text-white/30 max-w-xs">${error.message}</p>
                        <button
                            onclick="ambilDataBarang()"
                            class="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition"
                        >Coba Lagi</button>
                    </div>
                </td>
            </tr>`;
        document.getElementById('row-count').textContent = 'Gagal memuat data';

        // Reset stats
        ['stat-total','stat-stok','stat-nilai'].forEach(id => {
            document.getElementById(id).textContent = '—';
        });
    }
}

// ── POST: Tambah Barang ──────────────────────────────────────

const API_TAMBAH_URL = 'http://localhost/PBPv2/api-toko/tambah_barang.php';

/**
 * Tampilkan alert inline di dalam form.
 * type: 'success' | 'error'
 */
function tampilAlert(pesan, type = 'success') {
    const el = document.getElementById('form-alert');
    el.className = ''; // reset classes

    if (type === 'success') {
        el.className = 'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-fade-in';
        el.innerHTML = `✅ ${pesan}`;
    } else {
        el.className = 'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 animate-fade-in';
        el.innerHTML = `❌ ${pesan}`;
    }

    // Auto hilang setelah 4 detik
    setTimeout(() => {
        el.className = 'hidden';
        el.innerHTML = '';
    }, 4000);
}

/** Kirim data baru ke PHP API via POST JSON, refresh tabel tanpa reload */
async function tambahBarang(nama, harga, stok) {
    const btnLabel = document.getElementById('btn-simpan-label');
    const btn      = document.getElementById('btn-simpan');

    // UI loading state
    btn.disabled    = true;
    btnLabel.textContent = 'Menyimpan…';

    try {
        // 1. Bungkus data menjadi JSON dan kirim via POST
        const response = await fetch(API_TAMBAH_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ nama_barang: nama, harga: harga, stok: stok })
        });

        const hasil = await response.json();

        if (hasil.status === 'success') {
            // 2. Tampilkan alert sukses
            tampilAlert(hasil.pesan || 'Barang berhasil disimpan!', 'success');

            // 3. Reset form
            document.getElementById('form-tambah-barang').reset();

            // 4. ✨ Refresh tabel otomatis — tanpa reload halaman!
            await ambilDataBarang();
        } else {
            tampilAlert(hasil.pesan || 'Gagal menyimpan data.', 'error');
        }

    } catch (error) {
        console.error('❌ Gagal POST:', error);
        tampilAlert('Tidak dapat terhubung ke server API.', 'error');
    } finally {
        // Kembalikan tombol ke state semula
        btn.disabled    = false;
        btnLabel.textContent = 'Simpan Barang';
    }
}

/** Toggle tampil/sembunyikan form body */
function toggleForm() {
    const body  = document.getElementById('form-body');
    const label = document.getElementById('toggle-label');
    const icon  = document.getElementById('toggle-icon');
    const isHidden = body.style.display === 'none';

    body.style.display   = isHidden ? '' : 'none';
    label.textContent    = isHidden ? 'Sembunyikan' : 'Tampilkan';
    icon.style.transform = isHidden ? '' : 'rotate(180deg)';
}

// ── Event Listener Submit Form ───────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-tambah-barang');

    form.addEventListener('submit', async (event) => {
        // ⛔ Cegah reload/blink halaman!
        event.preventDefault();

        // Ambil nilai dari input
        const nama  = document.getElementById('input-nama').value.trim();
        const harga = document.getElementById('input-harga').value.trim();
        const stok  = document.getElementById('input-stok').value.trim();

        // Validasi sederhana di sisi client
        if (!nama || !harga || !stok) {
            tampilAlert('Semua kolom wajib diisi!', 'error');
            return;
        }
        if (Number(harga) < 0 || Number(stok) < 0) {
            tampilAlert('Harga dan stok tidak boleh negatif.', 'error');
            return;
        }

        // Kirim ke API
        await tambahBarang(nama, harga, stok);
    });
});

// ── Inisialisasi ─────────────────────────────────────────────
// Jalankan fetch GET saat halaman pertama kali dimuat
ambilDataBarang();

// Cek apakah browser mendukung Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ Service Worker Berhasil Didaftarkan!', registration.scope);
            })
            .catch(err => {
                console.error('❌ Service Worker Gagal:', err);
            });
    });
}