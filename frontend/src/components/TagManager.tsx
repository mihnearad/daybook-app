import { useState } from 'react';
import type { Tag } from '../types';
import './TagManager.css';

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (name: string) => void;
  onDeleteTag: (tagId: number) => void;
}

export default function TagManager({ tags, onCreateTag, onDeleteTag }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim());
      setNewTagName('');
    }
  };

  return (
      <div className="tag-manager">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary"
        >
          {isOpen ? '✖️ Close' : '🏷️ Manage Tags'}
        </button>

        {isOpen && (
          <div className="tag-manager-panel">
            <div className="panel-header">
              <h3>🏷️ Tag Manager</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-close-panel"
                title="Close"
              >
                ✖️
              </button>
            </div>

            <form onSubmit={handleSubmit} className="new-tag-form">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name..."
                className="tag-input"
                maxLength={50}
              />
              <button type="submit" className="btn btn-primary">
                ➕ Add
              </button>
            </form>

            <div className="existing-tags">
              <h4>📋 Existing Tags ({tags.length})</h4>
              {tags.length === 0 ? (
                <p className="no-tags">No tags created yet.</p>
              ) : (
                <ul className="tag-list">
                  {tags.map((tag, index) => (
                    <li key={tag.id} className="tag-item" style={{ animationDelay: `${index * 0.05}s` }}>
                      <span className="tag-name">🏷️ {tag.name}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete tag "${tag.name}"?`)) {
                            onDeleteTag(tag.id);
                          }
                        }}
                        className="btn-delete-tag"
                        title="Delete tag"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
