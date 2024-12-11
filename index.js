const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;
const validBahan = ["fb-botol-p", "fb-botol-b", "fb-kardus", "fb-kaleng"];

app.use(bodyParser.json());
app.use(cors());

// Membaca data dari file JSON
const dataPath = path.join(__dirname, 'kreasiData.json');
let kreasiData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Endpoint untuk mendapatkan seluruh data kreasi
app.get('/kreasi', (req, res) => {
    res.json(kreasiData);
});

// Endpoint untuk menambahkan kreasi baru
app.post('/kreasi', (req, res) => {
    const newKreasi = req.body;

    if (!newKreasi.nama_kreasi || !newKreasi.tag || !newKreasi.tingkat_kesulitan || !newKreasi.link_instruksi) {
        return res.status(400).json({ message: "Semua data harus diisi" });
    }

    kreasiData.push(newKreasi);

    // Menyimpan data kembali ke file JSON
    fs.writeFileSync(dataPath, JSON.stringify(kreasiData, null, 2), 'utf-8');
    res.status(201).json({ message: "Kreasi berhasil ditambahkan", data: newKreasi });
});

// Endpoint untuk memfilter kreasi berdasarkan tag dan tingkat kesulitan
app.get('/kreasi/filter', (req, res) => {
    const { bahan, kesulitan } = req.query;

    const bahanArray = bahan ? (Array.isArray(bahan) ? bahan : [bahan]) : [];
    const kesulitanArray = kesulitan ? (Array.isArray(kesulitan) ? kesulitan : [kesulitan]) : [];

    // Cek jika ada bahan yang tidak valid
    const invalidBahan = bahanArray.filter(b => !validBahan.includes(b));
    if (invalidBahan.length > 0) {
        return res.status(400).json({
            message: "Bahan yang diberikan tidak valid.",
            invalidBahan,
            validBahan
        });
    }

    const filteredData = kreasiData.filter(kreasi => {
        const matchBahan = bahanArray.length === 0 || bahanArray.includes(kreasi.tag);
        const matchKesulitan = kesulitanArray.length === 0 || kesulitanArray.includes(String(kreasi.tingkat_kesulitan));
        return matchBahan && matchKesulitan; // Logika "dan"
    });

    res.json(filteredData);
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

