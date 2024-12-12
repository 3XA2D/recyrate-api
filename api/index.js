const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 8080;
const validBahan = ["fb-botol-p", "fb-botol-b", "fb-kardus", "fb-kaleng"];

app.use(bodyParser.json());
app.use(cors());

// URL to fetch kreasi data
const jsonUrl = 'https://raw.githubusercontent.com/3XA2D/recyrate-api/main/api/kreasiData.json';

// Initialize kreasiData globally
let kreasiData = [];

// Function to load data from URL
async function fetchData() {
    try {
        const response = await axios.get(jsonUrl);
        kreasiData = response.data; // Store data in the global variable
    } catch (error) {
        console.error('Failed to load data:', error.message);
    }
}

// Load initial data when the server starts
fetchData();

// Endpoint to get all kreasi data
app.get('/api/kreasi', async (req, res) => {
    res.json(kreasiData); // Return the loaded kreasi data
});

// Endpoint to add a new kreasi
app.post('/api/kreasi', (req, res) => {
    const newKreasi = req.body;

    if (!newKreasi.nama_kreasi || !newKreasi.tag || !newKreasi.tingkat_kesulitan || !newKreasi.link_instruksi) {
        return res.status(400).json({ message: "All fields are required" });
    }

    kreasiData.push(newKreasi);

    // Write the updated data back to the file (assuming you're saving it locally)
    const dataPath = path.join(__dirname, 'kreasiData.json');
    fs.writeFileSync(dataPath, JSON.stringify(kreasiData, null, 2), 'utf-8');

    res.status(201).json({ message: "Kreasi successfully added", data: newKreasi });
});

// Endpoint to filter kreasi by tag and difficulty
app.get('/api/kreasi/filter', (req, res) => {
    const { bahan, kesulitan } = req.query;

    const bahanArray = bahan ? (Array.isArray(bahan) ? bahan : [bahan]) : [];
    const kesulitanArray = kesulitan ? (Array.isArray(kesulitan) ? kesulitan : [kesulitan]) : [];

    // Check if there are invalid bahan
    const invalidBahan = bahanArray.filter(b => !validBahan.includes(b));
    if (invalidBahan.length > 0) {
        return res.status(400).json({
            message: "Invalid bahan provided.",
            invalidBahan,
            validBahan
        });
    }

    const filteredData = kreasiData.filter(kreasi => {
        const matchBahan = bahanArray.length === 0 || bahanArray.includes(kreasi.tag);
        const matchKesulitan = kesulitanArray.length === 0 || kesulitanArray.includes(String(kreasi.tingkat_kesulitan));
        return matchBahan && matchKesulitan; // "AND" logic
    });

    res.json(filteredData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

