import express, { json } from 'express';
import cors from 'cors';
import WebTorrent from 'webtorrent'; 
import asyncHandler from 'express-async-handler'; // For cleaner async routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(json());
app.use(cors({ origin: 'http://localhost:3000' })); // Update for production

// State management
const torrents = new Map(); // Track active torrents
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.webm', '.avi'];
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Global client (singleton)
const client = new WebTorrent({
  maxConns: 55,
  downloadMax: 250 * 1024 * 1024, // 250MB limit
});

// Cleanup inactive torrents
setInterval(() => {
  const now = Date.now();
  for (const [infoHash, data] of torrents) {
    if (now - data.lastActive > IDLE_TIMEOUT) {
      console.log(`Destroying inactive torrent: ${infoHash}`);
      data.torrent.destroy();
      torrents.delete(infoHash);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Helper: Check if file is video
const isVideoFile = (name) => VIDEO_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));

// Test route
app.get('/status', (req, res) => {
  res.json({
    running: true,
    activeTorrents: torrents.size,
    clientDownloading: client.downloading.length,
    clientNumTorrents: client.torrents.length
  });
});

// Add torrent from magnet URI
app.post('/add-torrent', asyncHandler(async (req, res) => {
  const { magnetURI } = req.body;
  
  if (!magnetURI) {
    return res.status(400).json({ error: 'Magnet URI required' });
  }

  // Check if already exists
  if (torrents.has(client.get(magnetURI)?.infoHash)) {
    return res.status(409).json({ error: 'Torrent already added' });
  }

  const torrent = client.add(magnetURI, { announce: true });

  return new Promise((resolve) => {
    torrent.on('metadata', () => {
      const infoHash = torrent.infoHash;
      const videoFile = torrent.files.find((file) => isVideoFile(file.name));
      
      torrents.set(infoHash, {
        torrent,
        videoFile,
        lastActive: Date.now()
      });

      res.json({
        infoHash,
        name: torrent.name,
        sizeGB: (torrent.length / (1024 ** 3)).toFixed(2),
        hasVideo: !!videoFile,
        progress: torrent.progress
      });
      resolve();
    });

    torrent.on('error', (err) => {
      console.error('Torrent error:', err);
      res.status(400).json({ error: `Failed to load torrent: ${err.message}` });
      resolve();
    });

    // Track progress
    torrent.on('progress', () => {
      const data = torrents.get(torrent.infoHash);
      if (data) data.lastActive = Date.now();
    });
  });
}));

// Get torrent progress
app.get('/progress/:infoHash', asyncHandler(async (req, res) => {
  const { infoHash } = req.params;
  const data = torrents.get(infoHash);
  
  if (!data) {
    return res.status(404).json({ error: 'Torrent not found' });
  }

  data.lastActive = Date.now();
  res.json({
    progress: data.torrent.progress * 100,
    downloaded: data.torrent.downloaded,
    uploadSpeed: data.torrent.uploadSpeed,
    downloadSpeed: data.torrent.downloadSpeed,
    numPeers: data.torrent.numPeers
  });
}));

// Stream video with HTTP range requests
app.get('/:infoHash', asyncHandler(async (req, res) => {
  const { infoHash } = req.params;
  const data = torrents.get(infoHash);
  
  if (!data || !data.videoFile) {
    return res.status(404).json({ error: 'Video torrent not found' });
  }

  data.lastActive = Date.now();
  const file = data.videoFile;
  const fileSize = file.length;
  const range = req.headers.range;

  if (!range) {
    // Full file
    res.set({
      'Content-Type': getContentType(file.name),
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes'
    });
    file.createReadStream().pipe(res);
    return;
  }

  // Parse range: bytes=0-1023
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunksize = (end - start) + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': getContentType(file.name)
  });

  const stream = file.createReadStream({ start, end });
  stream.pipe(res);

  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream error' });
    }
  });

  req.on('close', () => stream.destroy());
}));

// NEW ROUTE: Stream for VLC Player (GET /vlc/:infoHash)
app.get('/vlc/:infoHash', asyncHandler(async (req, res) => {
  const { infoHash } = req.params;
  const data = torrents.get(infoHash);
  
  if (!data || !data.videoFile) {
    return res.status(404).json({ error: 'Video torrent not found' });
  }

  data.lastActive = Date.now();
  const file = data.videoFile;
  const fileSize = file.length;
  
  // VLC-specific headers
  res.setHeader('Content-Type', getContentType(file.name));
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Connection', 'close');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*'); // VLC network access
  
  const range = req.headers.range;
  
  if (!range) {
    // Full file stream for VLC
    res.setHeader('Content-Length', fileSize);
    const stream = file.createReadStream();
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error('VLC stream error:', err);
      if (!res.headersSent) res.status(500).end();
    });
    
    req.on('close', () => {
      console.log(`VLC client disconnected: ${infoHash}`);
      stream.destroy();
    });
    return;
  }

  // Range request (VLC seeking support)
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunksize = (end - start) + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Content-Length': chunksize,
  });

  const stream = file.createReadStream({ start, end });
  stream.pipe(res);

  stream.on('error', (err) => {
    console.error('VLC range stream error:', err);
    if (!res.headersSent) res.status(500).end();
  });

  req.on('close', () => stream.destroy());
  
  console.log(`🎬 VLC streaming ${file.name} (${chunksize} bytes from ${start})`);
}));


// Download full torrent file
app.post('/download/:infoHash', asyncHandler(async (req, res) => {
  const { infoHash } = req.params;
  const data = torrents.get(infoHash);
  
  if (!data || !data.videoFile) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  data.lastActive = Date.now();
  const file = data.videoFile;

  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.setHeader('Content-Type', getContentType(file.name));

  const stream = file.createReadStream();
  stream.pipe(res);

  stream.on('error', (err) => {
    console.error('Download stream error:', err);
    if (!res.headersSent) res.status(500).end();
  });

  req.on('close', () => stream.destroy());
}));

// Helper function
function getContentType(filename) {
  if (filename.endsWith('.mp4')) return 'video/mp4';
  if (filename.endsWith('.mkv')) return 'video/x-matroska';
  if (filename.endsWith('.webm')) return 'video/webm';
  return 'application/octet-stream';
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  for (const data of torrents.values()) {
    data.torrent.destroy();
  }
  client.destroy();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 WebTorrent Server running on http://localhost:${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
});
