CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT DEFAULT '',
  code TEXT NOT NULL UNIQUE,
  img_key TEXT DEFAULT '',
  src TEXT NOT NULL,
  date TEXT,
  created INTEGER NOT NULL
);
