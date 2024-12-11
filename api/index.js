const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Membuat aplikasi Express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Memuat data dari file JSON
const dataPath = path.join(process.cwd(), 'kreasiData.json');
let kreasiData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Endpoint untuk mendapatkan semua data
app.get('/api/kreasi', (req, res) => {
    res.json(kreasiData);
});

// Endpoint untuk menambahkan data baru
app.post('/api/kreasi', (req, res) => {
    const newKreasi = req.body;

    if (!newKreasi.nama_kreasi || !newKreasi.tag || !newKreasi.tingkat_kesulitan || !newKreasi.link_instruksi) {
        return res.status(400).json({ message: "Semua data harus diisi" });
    }

    kreasiData.push(newKreasi);

    // Simpan data kembali ke file JSON
    fs.writeFileSync(dataPath, JSON.stringify(kreasiData, null, 2), 'utf-8');
    res.status(201).json({ message: "Kreasi berhasil ditambahkan", data: newKreasi });
});

// Endpoint untuk memfilter data
app.get('/api/kreasi/filter', (req, res) => {
    const { bahan, kesulitan } = req.query;

    const bahanArray = bahan ? (Array.isArray(bahan) ? bahan : [bahan]) : [];
    const kesulitanArray = kesulitan ? (Array.isArray(kesulitan) ? kesulitan : [kesulitan]) : [];

    const filteredData = kreasiData.filter(kreasi => {
        const matchBahan = bahanArray.length === 0 || bahanArray.includes(kreasi.tag);
        const matchKesulitan = kesulitanArray.length === 0 || kesulitanArray.includes(String(kreasi.tingkat_kesulitan));
        return matchBahan || matchKesulitan; // Logika "atau"
    });

    res.json(filteredData);
});

// Mengekspor aplikasi untuk digunakan di Vercel
module.exports = app;
