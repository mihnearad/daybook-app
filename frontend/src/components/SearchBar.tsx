import { useState } from 'react';
import type { Tag } from '../types';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string, tagId?: number) => void;
  tags: Tag[];
}

export default function SearchBar({ onSearch, tags }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, selectedTagId);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTagId(undefined);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="search-input"
          />
        </div>

        <div className="tag-filter-wrapper">
          <span className="tag-icon">🏷️</span>
          <select
            value={selectedTagId || ''}
            onChange={(e) => setSelectedTagId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="tag-filter"
          >
            <option value="">All tags</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-search">
          🔍 Search
        </button>

        <button type="button" onClick={handleClear} className="btn btn-clear">
          ✖️ Clear
        </button>
      </form>
    </div>
  );
}
