import { useEffect, useMemo, useState } from 'react';

type Note = {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  color: string;
  updatedAt: string;
};

const starterNotes: Note[] = [
  {
    id: '1',
    title: 'Product vision',
    content: 'Shape the next release around calm focus, fast capture, and intelligent organization.',
    folder: 'Work',
    tags: ['vision', 'planning'],
    pinned: true,
    favorite: true,
    archived: false,
    color: '#7c3aed',
    updatedAt: '2026-06-25T09:00:00.000Z'
  },
  {
    id: '2',
    title: 'Research ideas',
    content: 'Collect findings from interviews and annotate the strongest opportunities.',
    folder: 'Research',
    tags: ['research', 'ideas'],
    pinned: false,
    favorite: false,
    archived: false,
    color: '#0f766e',
    updatedAt: '2026-06-24T16:30:00.000Z'
  }
];

const folderOptions = ['Work', 'Research', 'Personal'];

function App() {
  const [notes, setNotes] = useState<Note[]>(starterNotes);
  const [selectedId, setSelectedId] = useState(starterNotes[0].id);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          setNotes(data);
          setSelectedId(data[0].id);
        }
      }
    };
    fetchNotes();
  }, []);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? notes[0];

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase();
    return notes.filter((note) => {
      const matchesSearch = !query || [note.title, note.content, note.folder, note.tags.join(' ')].join(' ').toLowerCase().includes(query);
      return matchesSearch && !note.archived;
    });
  }, [notes, search]);

  const updateNote = async (updated: Note) => {
    setNotes((current) => current.map((note) => (note.id === updated.id ? updated : note)));
    await fetch(`/api/notes/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  };

  const createNote = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled note',
      content: 'Start writing...',
      folder: 'Personal',
      tags: [],
      pinned: false,
      favorite: false,
      archived: false,
      color: '#3b82f6',
      updatedAt: new Date().toISOString()
    };
    setNotes((current) => [newNote, ...current]);
    setSelectedId(newNote.id);
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });
  };

  const archiveNote = async (id: string) => {
    const next = notes.map((note) => (note.id === id ? { ...note, archived: true } : note));
    setNotes(next);
    await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next.find((note) => note.id === id))
    });
  };

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <div>
            <p className="eyebrow">Premium workspace</p>
            <h1>Nova Notes</h1>
          </div>
          <button className="ghost-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <button className="primary-btn" onClick={createNote}>+ New note</button>

        <div className="search-box">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes" />
        </div>

        <div className="section-card">
          <h3>Quick views</h3>
          <ul>
            <li>Recent notes</li>
            <li>Favorites</li>
            <li>Archived</li>
          </ul>
        </div>

        <div className="section-card">
          <h3>Folders</h3>
          <ul>
            {folderOptions.map((folder) => (
              <li key={folder}>{folder}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today</p>
            <h2>Capture, organize, and ship ideas</h2>
          </div>
          <div className="topbar-actions">
            <button className="ghost-btn">AI summarize</button>
            <button className="primary-btn">Share</button>
          </div>
        </header>

        <div className="content-grid">
          <section className="notes-list">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                className={`note-card ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="note-card-top">
                  <strong>{note.title}</strong>
                  {note.pinned && <span>📌</span>}
                </div>
                <p>{note.content}</p>
                <div className="note-card-footer">
                  <span>{note.folder}</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </section>

          <section className="editor-panel">
            {selectedNote ? (
              <>
                <div className="editor-toolbar">
                  <input
                    className="title-input"
                    value={selectedNote.title}
                    onChange={(e) => updateNote({ ...selectedNote, title: e.target.value, updatedAt: new Date().toISOString() })}
                    placeholder="Note title"
                  />
                  <div className="toolbar-actions">
                    <button onClick={() => updateNote({ ...selectedNote, pinned: !selectedNote.pinned, updatedAt: new Date().toISOString() })}>📌</button>
                    <button onClick={() => updateNote({ ...selectedNote, favorite: !selectedNote.favorite, updatedAt: new Date().toISOString() })}>⭐</button>
                    <button onClick={() => archiveNote(selectedNote.id)}>🗄️</button>
                  </div>
                </div>

                <div className="meta-row">
                  <select value={selectedNote.folder} onChange={(e) => updateNote({ ...selectedNote, folder: e.target.value, updatedAt: new Date().toISOString() })}>
                    {folderOptions.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
                  </select>
                  <input
                    value={selectedNote.tags.join(', ')}
                    onChange={(e) => updateNote({ ...selectedNote, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean), updatedAt: new Date().toISOString() })}
                    placeholder="Tags"
                  />
                </div>

                <textarea
                  className="editor-area"
                  value={selectedNote.content}
                  onChange={(e) => updateNote({ ...selectedNote, content: e.target.value, updatedAt: new Date().toISOString() })}
                />
              </>
            ) : (
              <p>Select a note to begin.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
