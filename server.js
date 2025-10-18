const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API endpoint to get images
app.get('/api/images', async (req, res) => {
    try {
        const imagesDir = path.join(__dirname, 'public', 'images');

        // Check if directory exists
        try {
            await fs.access(imagesDir);
        } catch {
            // Directory doesn't exist, create it
            await fs.mkdir(imagesDir, { recursive: true });
            return res.json([]);
        }

        // Read directory
        const files = await fs.readdir(imagesDir);

        // Filter for image files
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });

        // Sort files alphabetically
        imageFiles.sort();

        // Create response with image paths
        const images = imageFiles.map(file => ({
            path: `public/images/${file}`,
            name: file
        }));

        res.json(images);
    } catch (error) {
        console.error('Error reading images directory:', error);
        res.status(500).json({ error: 'Failed to load images' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎂 Birthday surprise server running at http://localhost:${PORT}`);
    console.log(`📁 Place your images in: ${path.join(__dirname, 'public', 'images')}`);
    console.log(`🔒 Default password: birthday2025 (change in script.js)`);
});
