import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import AddEditNoteModal from "../components/AddEditNoteModal";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all notes belonging to the logged-in user
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setNotes(data.notes || []);
      } else {
        setError(data.msg || "Failed to load notes");
      }
    } catch (err) {
      console.error("Fetch notes error:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle Pinned Status
  const handlePinNote = async (note) => {
    try {
      const response = await fetch(`/api/v1/notes/${note._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });

      if (response.ok) {
        fetchNotes(); // Refresh notes list
      }
    } catch (err) {
      console.error("Error pinning note:", err);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/v1/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotes(); // Refresh notes list
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Save Note (Create or Update)
  const handleSaveNote = async (noteData) => {
    const isEditing = !!noteToEdit;
    const url = isEditing ? `/api/v1/notes/${noteToEdit._id}` : "/api/v1/notes";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setNoteToEdit(null);
        fetchNotes(); // Refresh list
      } else {
        alert(data.msg || "Save operation failed");
      }
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const handleEditClick = (note) => {
    setNoteToEdit(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNoteToEdit(null);
  };

  // Filter notes by search query (match title or tags)
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    const tagMatch = note.tags.some((tag) => tag.toLowerCase().includes(query));
    return titleMatch || tagMatch;
  });

  // Sort notes: float pinned notes to the top of the list
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
  );

  return (
    <div className="dashboard-container">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="main-content">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <h3>Loading your notes...</h3>
          </div>
        ) : sortedNotes.length > 0 ? (
          <div className="notes-grid">
            {sortedNotes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                color={note.color}
                date={note.createdAt}
                onPin={() => handlePinNote(note)}
                onEdit={() => handleEditClick(note)}
                onDelete={() => handleDeleteNote(note._id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>📝</span>
            <h3>No Notes Found</h3>
            <p>
              {searchQuery
                ? "No notes match your search criteria. Try a different query!"
                : "Start adding tasks or ideas to keep track of them!"}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) to Add Note */}
      <button
        className="fab"
        onClick={() => {
          setNoteToEdit(null);
          setIsModalOpen(true);
        }}
        title="Add Note"
      >
        +
      </button>

      {/* Add / Edit Note Modal */}
      {/* Passing a key ensures React recreates the modal and resets inputs when noteToEdit changes */}
      <AddEditNoteModal
        key={noteToEdit ? noteToEdit._id : isModalOpen ? "open" : "closed"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        noteToEdit={noteToEdit}
      />
    </div>
  );
};

export default Dashboard;
