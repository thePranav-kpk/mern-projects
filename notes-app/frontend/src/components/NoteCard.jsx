const NoteCard = ({
  title,
  content,
  tags,
  isPinned,
  color,
  date,
  onEdit,
  onDelete,
  onPin,
}) => {
  // Format Date to a clean format (e.g. Jul 8, 2026)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div
      className="note-card"
      style={{
        backgroundColor: color || "var(--bg-card)",
        border:
          color && color !== "var(--bg-card)"
            ? "1px solid rgba(255, 255, 255, 0.15)"
            : "1px solid var(--border-color)",
      }}
    >
      <div className="note-header">
        <h3 className="note-title">{title}</h3>
        <button
          onClick={onPin}
          className={`pin-btn ${isPinned ? "pinned" : ""}`}
          title={isPinned ? "Unpin Note" : "Pin Note"}
        >
          📌
        </button>
      </div>

      <p className="note-content">{content}</p>

      <div className="note-footer">
        <div>
          <span className="note-date">{formatDate(date)}</span>
          <div className="note-tags" style={{ marginTop: "6px" }}>
            {tags &&
              tags.map((tag, idx) => (
                <span key={idx} className="tag-badge">
                  #{tag}
                </span>
              ))}
          </div>
        </div>

        <div className="note-actions">
          <button onClick={onEdit} className="action-btn" title="Edit Note">
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="action-btn delete-btn"
            title="Delete Note"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
