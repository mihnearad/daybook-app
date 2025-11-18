import { useState } from 'react';
import './Settings.css';

interface SettingsProps {
  onExportMarkdown: () => void;
  onExportJSON: () => void;
}

export default function Settings({ onExportMarkdown, onExportJSON }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
      <div className="settings">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-settings"
          title="Settings"
        >
          {isOpen ? '✖️ Close' : '⚙️ Settings'}
        </button>

        {isOpen && (
          <div className="settings-panel">
            <div className="panel-header">
              <h3>⚙️ Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-close-panel"
                title="Close"
              >
                ✖️
              </button>
            </div>

            <div className="settings-section">
              <h4>📦 Export & Backup</h4>
              <p className="settings-description">
                Export all your notes for backup or data portability.
              </p>

              <div className="export-buttons">
                <button
                  onClick={() => {
                    onExportMarkdown();
                    setIsOpen(false);
                  }}
                  className="btn btn-export"
                >
                  <span className="btn-icon">📄</span>
                  <div className="btn-content">
                    <div className="btn-title">Export All (Markdown)</div>
                    <div className="btn-subtitle">Human-readable format</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportJSON();
                    setIsOpen(false);
                  }}
                  className="btn btn-export-json"
                >
                  <span className="btn-icon">📋</span>
                  <div className="btn-content">
                    <div className="btn-title">Export All (JSON)</div>
                    <div className="btn-subtitle">Full data structure</div>
                  </div>
                </button>
              </div>

              <p className="settings-hint">
                💡 Tip: Use Markdown for readability, JSON for data preservation
              </p>
            </div>
          </div>
        )}
      </div>
  );
}
