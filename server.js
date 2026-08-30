const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors());

// Test route to ensure server is alive
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.url;

        if (!videoURL || !ytdl.validateURL(videoURL)) {
            return res.status(400).send('Please enter a valid YouTube link.');
        }

        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        ytdl(videoURL, {
            format: 'mp4',
            filter: 'audioandvideo',
            quality: 'highest'
        }).pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('YouTube blocked this stream request or video is unavailable.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
