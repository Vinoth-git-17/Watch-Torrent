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
      console.log(`Torrent added: ${torrent.name}`);
  
      // Collect metadata
      const files = torrent.files.map(file => ({
        name: file.name,
        size: file.length,
      }));
  
      res.json({
        name: torrent.name,
        files,
        infoHash: torrent.infoHash,
      });
    });
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
