function prosesKonversi() {
    // 1. Mengambil input dari pengguna
    const inputSuhu = document.getElementById('inputSuhu').value;
    const dari = document.getElementById('dariUnit').value;
    const ke = document.querySelector('input[name="keUnit"]:checked').value;
    
    const resultArea = document.getElementById('result-area');
    const hasilTeks = document.getElementById('hasilTeks');

    if (inputSuhu === "") {
        alert("Harap masukkan nilai suhu!");
        return;
    }

    const nilai = parseFloat(inputSuhu);
    let hasil = 0;

    // 2. Logika Konversi Suhu (Sesuai 6 ketentuan tugas)
    if (dari === "C") {
        if (ke === "F") hasil = (nilai * 9/5) + 32; 
        else if (ke === "R") hasil = nilai * 4/5;   
        else hasil = nilai;
    } 
    else if (dari === "F") {
        if (ke === "C") hasil = (nilai - 32) * 5/9; 
        else if (ke === "R") hasil = (nilai - 32) * 4/9; 
        else hasil = nilai;
    } 
    else if (dari === "R") {
        if (ke === "C") hasil = nilai * 5/4;        
        else if (ke === "F") hasil = (nilai * 9/4) + 32; 
        else hasil = nilai;
    }

    // 3. Menampilkan hasil konversi di halaman HTML
    resultArea.style.display = "block";
    hasilTeks.innerText = hasil.toFixed(2) + " °" + ke;
}

function resetForm() {
    document.getElementById('inputSuhu').value = "";
    document.getElementById('dariUnit').selectedIndex = 0;
    document.querySelector('input[name="keUnit"][value="F"]').checked = true;
    document.getElementById('result-area').style.display = "none";
}