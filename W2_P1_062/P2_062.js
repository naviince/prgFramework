// Fungsi untuk menghitung usia berdasarkan tahun lahir
function hitungUsia(tahunLahir) {
    // Mendapatkan tahun saat ini menggunakan objek Date
    const tahunSekarang = new Date().getFullYear();
    // Menghitung usia
    const usia = tahunSekarang - tahunLahir;
    return usia;
}

// Menangani event submit form
document.getElementById('formUsia').addEventListener('submit', function (event) {
    event.preventDefault(); // Mencegah form dari reload halaman

    // Mengambil input tahun lahir dari pengguna
    const inputTahunLahir = document.getElementById('tahunLahir').value; 

    // Konversi input menjadi tipe data number
    const tahunLahir = parseInt(inputTahunLahir, 10);

    // Validasi input: Pastikan tahun lahir tidak kosong dan masuk akal
    if (isNaN(tahunLahir) || tahunLahir <= 0) {
        document.getElementById('hasil').innerText = "Masukkan tahun lahir yang valid!";
        return;
    }

    // Memanggil fungsi hitungUsia
    const usia = hitungUsia(tahunLahir);

    // Validasi apakah usia masuk akal
    if (usia < 0) {
        document.getElementById('hasil').innerText = "Tahun lahir lebih besar dari tahun sekarang!";
    } else {
        // Menampilkan hasil usia
        document.getElementById('hasil').innerText = `Usia Anda adalah ${usia} tahun.`;
    }
});