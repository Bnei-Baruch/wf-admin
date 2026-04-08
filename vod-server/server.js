const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const VOD_MAPS_DIR = process.env.VOD_MAPS_DIR || '/usr/local/var/vod-maps';
const PORT = process.env.PORT || 80;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());

app.put('/vod-maps/:filename', (req, res) => {
    const {filename} = req.params;
    if (!filename.endsWith('.json') || filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({error: 'Invalid filename'});
    }
    const filePath = path.join(VOD_MAPS_DIR, filename);
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            console.error('Write error:', err);
            return res.status(500).json({error: err.message});
        }
        console.log('Saved:', filePath);
        res.json({ok: true, file: filename});
    });
});

app.get('/vod-maps/:filename', (req, res) => {
    const filePath = path.join(VOD_MAPS_DIR, req.params.filename);
    res.sendFile(filePath, err => err && res.status(404).json({error: 'Not found'}));
});

app.delete('/vod-maps/:filename', (req, res) => {
    const filePath = path.join(VOD_MAPS_DIR, req.params.filename);
    fs.unlink(filePath, err => err ? res.status(404).json({error: 'Not found'}) : res.json({ok: true}));
});

app.get('/health', (req, res) => res.json({ok: true}));

app.listen(PORT, () => console.log(`VOD server on port ${PORT}, maps dir: ${VOD_MAPS_DIR}`));
