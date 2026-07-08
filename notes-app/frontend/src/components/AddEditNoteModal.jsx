import { useState } from "react";

const COLORS = [
  { name: "Default", value: "rgba(26, 35, 50, 0.65)" },
  { name: "Indigo", value: "rgba(99, 102, 241, 0.15)" },
  { name: "Emerald", value: "rgba(16, 185, 129, 0.15)" },
  { name: "Rose", value: "rgba(239, 68, 68, 0.15)" },
  { name: "Amber", value: "rgba(245, 158, 11, 0.15)" },
  { name: "Violet", value: "rgba(139, 92, 246, 0.15)" },
];

const AddEditNoteModal = ({ isOpen, onClose, onSave, noteToEdit }) => {
  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : "");
  const [content, setContent] = useState(noteToEdit ? noteToEdit.content : "");
  const [tags, setTags] = useState(noteToEdit ? noteToEdit.tags : []);
  const [tagInput, setTagInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    noteToEdit ? noteToEdit.color : COLORS[0].value,
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and content for your note.");
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags,
      color: selectedColor,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{noteToEdit ? "Edit Note" : "Add New Note"}</h2>
          <button className="close-modal-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="modal-title">Note Title</label>
            <input
              type="text"
              id="modal-title"
              placeholder="e.g. Study Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="modal-content">Note Content</label>
            <textarea
              id="modal-content"
              rows="6"
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="input-group">
            <label>Tags</label>
            <div className="tag-input-wrapper">
              <input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag(e)}
              />
              <button
                type="button"
                className="btn"
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
            <div className="tag-input-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag-badge-removable">
                  #{tag}
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Card Color</label>
            <div className="color-picker">
              {COLORS.map((color) => (
                <div
                  key={color.name}
                  className={`color-option ${selectedColor === color.value ? "selected" : ""}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn logout-btn"
              onClick={onClose}
              style={{ border: "1px solid var(--border-color)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "auto", padding: "12px 30px" }}
            >
              {noteToEdit ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditNoteModal;
