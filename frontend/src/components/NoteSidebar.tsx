import { format } from 'date-fns';
import type { Note } from '../types';
import './NoteSidebar.css';

interface NoteSidebarProps {
  notes: Note[];
  onNoteSelect: (date: string) => void;
  selectedDate: Date;
  selectedNotes: Set<string>;
  onToggleNoteSelection: (date: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExportSelected: () => void;
}

export default function NoteSidebar({
  notes,
  onNoteSelect,
  selectedDate,
  selectedNotes,
  onToggleNoteSelection,
  onSelectAll,
  onClearSelection,
  onExportSelected
}: NoteSidebarProps) {
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const getPreview = (content: string, maxLength = 100) => {
    const plainText = content.replace(/[#*`_~]/g, '').trim();
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  return (
    <div className="note-sidebar">
      <div className="sidebar-header">
        <h3>Recent Notes</h3>
        <div className="selection-controls">
          <button onClick={onSelectAll} className="btn-select" title="Select all notes">
            Select All
          </button>
          <button onClick={onClearSelection} className="btn-select" title="Clear selection">
            Clear
          </button>
        </div>
      </div>

      {selectedNotes.size > 0 && (
        <button onClick={onExportSelected} className="btn-export-selected">
          Export Selected ({selectedNotes.size})
        </button>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="no-notes">No notes yet. Start writing!</p>
        ) : (
          notes.map(note => {
            const noteDate = note.date;
            const isSelected = noteDate === selectedDateStr;
            const isChecked = selectedNotes.has(noteDate);

            return (
              <div
                key={note.id}
                className={`note-item ${isSelected ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleNoteSelection(noteDate);
                  }}
                  className="note-checkbox"
                  title="Select for export"
                />
                <div
                  className="note-content-wrapper"
                  onClick={() => onNoteSelect(noteDate)}
                >
                  <div className="note-date">
                    {format(new Date(noteDate), 'MMM dd, yyyy')}
                  </div>
                  {note.content && (
                    <div className="note-preview">
                      {getPreview(note.content)}
                    </div>
                  )}
                  {note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map(tag => (
                        <span key={tag.id} className="tag">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
