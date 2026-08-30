const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

// Allow frontend requests
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Download endpoint
app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.url;

        if (!videoURL || !ytdl.validateURL(videoURL)) {
            return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
        }

        // Force browser to download file as video.mp4
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');

        // Pipe YouTube stream directly to user response
        ytdl(videoURL, { 
            format: 'mp4',
            quality: 'highestvideo' 
        }).pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
