import React, { useState } from "react";
import UrlForm from "./components/UrlForm";
import UrlCard from "./components/UrlCard";
import type { URLData } from "./types/api.types";
import { Link } from "lucide-react";

const App: React.FC = () => {
  const [urls, setUrls] = useState<URLData[]>([]);

  const handleUrlShortened = (newUrl: URLData) => {
    // Add newly shortened URL to top of list
    setUrls((prev) => [newUrl, ...prev]);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="header">
        <div
          className="logo"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Link size={24} color="#6366f1" />
          <span>TrimURL</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Shortener Input Form */}
        <UrlForm onUrlShortened={handleUrlShortened} />

        {/* Shortened Links Feed */}
        {urls.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h3 className="section-title">Your Shortened Links</h3>
            {urls.map((url) => (
              <UrlCard key={url._id} url={url} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
