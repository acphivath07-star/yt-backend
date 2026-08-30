const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.url;

        if (!videoURL) {
            return res.status(400).send('Please provide a valid YouTube URL.');
        }

        // Fetch video metadata using yt-dlp
        const output = await ytDlp(videoURL, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true
        });

        const title = (output.title || 'video').replace(/[^\w\s]/gi, '');
        
        // Find a pre-merged format (has both video and audio)
        const format = output.formats.reverse().find(
            f => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4'
        ) || output.formats[0];

        if (!format || !format.url) {
            return res.status(500).send('Could not find a downloadable stream.');
        }

        // Set response header to force file download in browser
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        // Redirect client to direct stream URL
        res.redirect(format.url);

    } catch (error) {
        console.error('yt-dlp Error:', error);
        res.status(500).send('Failed to process video. YouTube may have updated its signatures.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));