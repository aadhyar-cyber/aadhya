import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'notes.json');

app.use(cors());
app.use(express.json());

const readNotes = async () => {
  try {
    const content = await readFile(dataFile, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeNotes = async (notes) => {
  await writeFile(dataFile, JSON.stringify(notes, null, 2));
};

app.get('/api/notes', async (_req, res) => {
  const notes = await readNotes();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const notes = await readNotes();
  notes.unshift(req.body);
  await writeNotes(notes);
  res.json(req.body);
});

app.put('/api/notes/:id', async (req, res) => {
  const notes = await readNotes();
  const index = notes.findIndex((note) => note.id === req.params.id);
  if (index >= 0) {
    notes[index] = { ...notes[index], ...req.body };
    await writeNotes(notes);
    res.json(notes[index]);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
