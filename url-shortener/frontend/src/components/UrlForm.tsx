import React, { useState, type FormEvent } from "react";
import { Link2 } from "lucide-react";
import type { URLData } from "../types/api.types";

interface UrlFormProps {
  onUrlShortened: (newUrl: URLData) => void;
}

const UrlForm: React.FC<UrlFormProps> = ({ onUrlShortened }) => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!originalUrl.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/v1/urls/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: originalUrl.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onUrlShortened(data);
        setOriginalUrl("");
      } else {
        setError(data.error || data.msg || "Failed to shorten URL");
      }
    } catch (err) {
      console.error("Shorten URL error:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-box">
      <h3 className="section-title">
        <Link2
          size={20}
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        />
        Shorten a Long Link
      </h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <input
            type="url"
            placeholder="Paste your long URL here (e.g. https://example.com/very-long-link)"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 18px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ whiteSpace: "nowrap", padding: "0 28px" }}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>
    </div>
  );
};

export default UrlForm;
