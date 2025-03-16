import express, {json} from 'express';
import WebTorrent from 'webtorrent';
import cors from 'cors';
const app = express();
const client = new WebTorrent();

app.use(json());
// Enable CORS
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);

// Test Route
app.get('/', (req, res) => {
  res.send("Watch Torrent is Running...");
});


app.post('/add-torrent', (req, res) => {
    const { magnetURI } = req.body;
    
    if (!magnetURI) {
      return res.status(400).json({ error: 'Magnet URI is required' });
    }
  
    client.add(magnetURI, (torrent) => {
  
      const file = torrent.files.find(f => f.name.endsWith(".mp4") || f.name.endsWith(".mkv"));
      if (!file) return res.status(404).json({ error: "No video file found" });

      res.json({ name : file.name, size: file.length, infoHash });
      
    });
  });

app.post('/download-torrent', (req, res) => {
    const { magnetURI } = req.body;
    
    if (!magnetURI) {
      return res.status(400).json({ error: 'Magnet URI is required' });
    }
  
    client.add(magnetURI, (torrent) => {
  
      const file = torrent.files.find(f => f.name.endsWith(".mp4") || f.name.endsWith(".mkv"));
      if (!file) return res.status(404).json({ error: "No video file found" });

      res.json({ name : file.name, size: file.length, infoHash });
      
    });
  });

  app.get("/stream/:hash", async (req, res) => {
    const torrent = await client.get(req.params.hash);
    if (!torrent) return res.status(404).json({ error: "Torrent not found" });

    const file = torrent.files.find(f => f.name.endsWith(".mp4") || f.name.endsWith(".mkv"));
    res.setHeader("Content-Type", "video/mkv");
    file.createReadStream().pipe(res);
});
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
