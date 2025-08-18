require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, 'data', 'publications.json');
const FILES_DIR = path.join(ROOT, 'files');
const COVERS_DIR = path.join(ROOT, 'assets', 'covers');

if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'change_this_session_secret',
  resave: false,
  saveUninitialized: false
}));

// Serve static site + uploads
app.use(express.static(ROOT));

function loadDB() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}
function saveDB(db) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
}

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Server not configured.' });
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Invalid password' });
});
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// --- Upload handlers ---
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function saveBufferTo(dir, baseName, buffer) {
  const id = nanoid(6);
  const safe = baseName.toLowerCase().replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g,'');
  const filePath = path.join(dir, `${safe}-${id}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}
function withExt(filePath, originalName, fallbackExt) {
  const ext = path.extname(originalName) || fallbackExt;
  const finalPath = `${filePath}${ext}`;
  fs.renameSync(filePath, finalPath);
  return finalPath;
}

// --- List items for related selection ---
app.get('/api/items', requireAdmin, (req, res) => {
  const db = loadDB();
  const all = ['books','papers','thesis','drafts'].flatMap(type =>
    (db[type] || []).map(x => ({ id: x.id, type, title: x.title }))
  );
  res.json(all);
});

// --- Create item ---
app.post('/api/items', requireAdmin, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  try {
    const { type, title, authors, year, venue, abstract, doi, link, relatedIds } = req.body;
    if (!['books','papers','thesis','drafts'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    const id = nanoid(10);

    let pdfRel = '';
    if (req.files?.pdf?.[0]) {
      const base = saveBufferTo(FILES_DIR, title || 'item', req.files.pdf[0].buffer);
      const final = withExt(base, req.files.pdf[0].originalname, '.pdf');
      pdfRel = path.relative(ROOT, final).replace(/\\/g,'/');
    }

    let thumbRel = '';
    if (req.files?.thumbnail?.[0]) {
      const base = saveBufferTo(COVERS_DIR, title || 'cover', req.files.thumbnail[0].buffer);
      const final = withExt(base, req.files.thumbnail[0].originalname, '.jpg');
      thumbRel = path.relative(ROOT, final).replace(/\\/g,'/');
    }

    const rel = (relatedIds || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const item = {
      id,
      title: title || 'Untitled',
      authors: authors || '',
      year: year ? parseInt(year,10) : null,
      venue: venue || '',
      abstract: abstract || '',
      thumbnail: thumbRel || '',
      pdf: pdfRel || '',
      doi: doi || '',
      link: link || '',
      relatedIds: rel
    };

    const db = loadDB();
    db[type] = db[type] || [];
    db[type].push(item);

    // sort newest first by year then title
    db[type].sort((a,b) => {
      const ay = a.year || -1, by = b.year || -1;
      if (by !== ay) return by - ay;
      return (a.title||'').localeCompare(b.title||'');
    });

    saveDB(db);
    res.json({ ok: true, item });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create item' });
  }
});
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
