"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    setUsername(cookies.session || null);
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch("/api/notes/get");
    const data = await res.json();
    if (data.notes) {
      setNotes(data.notes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, is_public: isPublic }),
    });

    if (res.ok) {
      setTitle("");
      setText("");
      setIsPublic(false);
      fetchNotes();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create note");
    }
  };

  const handleMakePublic = async (noteId: number) => {
    const res = await fetch("/api/notes/make-public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });

    if (res.ok) {
      fetchNotes();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to make note public");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">{username ? `Welcome, ${username}` : "No user logged in"}</h1>
        {username && (
          <>
            <h2 className="text-xl font-semibold mb-2">Create Note</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="mb-6">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />
              <textarea
                placeholder="Note text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                Public
              </label>
              <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                Add Note
              </button>
            </form>
          </>
        )}
        <h2 className="text-xl font-semibold mb-2">Notes</h2>
        <div className="space-y-4">
          {notes.length === 0 && <p>No notes available.</p>}
          {notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded border">
              <h3 className="font-bold">{note.title}</h3>
              <p>{note.text}</p>
              <p className="text-sm text-gray-500">
                By {note.username} on {new Date(note.created_at).toLocaleString()} •{" "}
                {note.is_public ? "Public" : "Private"}
              </p>
              {username && note.username === username && note.is_public === 0 && (
                <button
                  onClick={() => handleMakePublic(note.id)}
                  className="mt-2 p-1 bg-blue-500 text-white rounded text-sm cursor-pointer"
                >
                  Make Public
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {username && (
            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
