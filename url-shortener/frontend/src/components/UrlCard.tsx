import React, { useState } from "react";
import { Copy, Check, BarChart2, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { URLData } from "../types/api.types";

interface UrlCardProps {
  url: URLData;
}

const UrlCard: React.FC<UrlCardProps> = ({ url }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  // Construct full short link
  const shortUrl = `${window.location.origin}/r/${url.shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div
      className="section-box"
      style={{
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Top Row: Short Link & Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <a
            href={`/r/${url.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              color: "var(--color-accent)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {shortUrl}
            <ExternalLink size={16} />
          </a>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginTop: "4px",
              wordBreak: "break-all",
            }}
          >
            Destination: {url.originalUrl}
          </p>
        </div>

        {/* Action Buttons: Copy & QR Code */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCopy}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "0.9rem",
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={() => setShowQr(!showQr)}
            className="logout-btn"
            title="Toggle QR Code"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
            }}
          >
            <QrCode size={16} />
            {showQr ? "Hide QR" : "QR Code"}
          </button>
        </div>
      </div>

      {/* Analytics Row: Total Clicks & Last Clicked Date */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
        }}
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <BarChart2 size={16} color="var(--color-success)" />
          Total Clicks:{" "}
          <strong style={{ color: "var(--text-primary)" }}>{url.clicks}</strong>
        </span>

        <span>
          Last Clicked:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {formatDate(url.lastClickedAt)}
          </strong>
        </span>
      </div>

      {/* QR Code Collapsible Section */}
      {showQr && (
        <div
          style={{
            marginTop: "12px",
            padding: "20px",
            backgroundColor: "var(--bg-primary)",
            borderRadius: "8px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "12px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            }}
          >
            <QRCodeSVG value={shortUrl} size={150} />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Scan to open link on mobile
          </p>
        </div>
      )}
    </div>
  );
};

export default UrlCard;
