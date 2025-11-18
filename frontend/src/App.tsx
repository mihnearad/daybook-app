import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Calendar from "./components/Calendar";
import NoteEditor from "./components/NoteEditor";
import NoteSidebar from "./components/NoteSidebar";
import SearchBar from "./components/SearchBar";
import Settings from "./components/Settings";
import TagManager from "./components/TagManager";
import ThemeToggle from "./components/ThemeToggle";
import { notesApi, tagsApi, searchApi, exportApi } from "./services/api";
import type { Note, Tag } from "./types";
import logo from "./assets/logo.png";
import "./App.css";

function App() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [noteDates, setNoteDates] = useState<Set<string>>(new Set());
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState<Note[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    // Define functions before useEffect hooks that use them
    const loadNotes = useCallback(async () => {
        try {
            const notes = await notesApi.getAll();
            setAllNotes(notes);
            const dates = new Set(notes.map((n) => n.date));
            setNoteDates(dates);
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    }, []);

    const loadTags = useCallback(async () => {
        try {
            const fetchedTags = await tagsApi.getAll();
            setTags(fetchedTags);
        } catch (error) {
            console.error("Error loading tags:", error);
        }
    }, []);

    const loadNoteForDate = useCallback(async (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        try {
            const note = await notesApi.getByDate(dateStr);
            setCurrentNote(note);
        } catch (error) {
            // Note doesn't exist for this date
            setCurrentNote(null);
        }
    }, []);

    // Load all notes and tags on mount
    useEffect(() => {
        loadNotes();
        loadTags();
    }, [loadNotes, loadTags]);

    // Load note for selected date
    useEffect(() => {
        if (!isSearchMode) {
            loadNoteForDate(selectedDate);
        }
    }, [selectedDate, isSearchMode, loadNoteForDate]);

    // Handle scroll event for header elevation
    useEffect(() => {
        const handleScroll = () => {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                setIsHeaderScrolled(mainContent.scrollTop > 20);
            }
        };

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.addEventListener('scroll', handleScroll);
            return () => mainContent.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsSearchMode(false);
        setSearchResults([]);
    };

    const handleNoteSelect = (dateStr: string) => {
        setSelectedDate(new Date(dateStr));
        setIsSearchMode(false);
        setSearchResults([]);
    };

    const handleSaveNote = useCallback(async (content: string, tagIds: number[]) => {
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        try {
            if (currentNote) {
                // Update existing note
                const updated = await notesApi.update(dateStr, {
                    content,
                    tag_ids: tagIds,
                });
                setCurrentNote(updated);
            } else {
                // Create new note
                const created = await notesApi.create({
                    date: dateStr,
                    content,
                    tag_ids: tagIds,
                });
                setCurrentNote(created);
            }

            // Reload notes list
            await loadNotes();
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note. Please try again.");
            throw error; // Re-throw so auto-save knows it failed
        }
    }, [selectedDate, currentNote, loadNotes]);

    const handleDeleteNote = async () => {
        if (!currentNote) return;

        if (!confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            await notesApi.delete(currentNote.date);
            setCurrentNote(null);
            await loadNotes();
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note. Please try again.");
        }
    };

    const handleCreateTag = async (name: string) => {
        try {
            await tagsApi.create(name);
            await loadTags();
        } catch (error) {
            console.error("Error creating tag:", error);
            alert("Failed to create tag. It may already exist.");
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        try {
            await tagsApi.delete(tagId);
            await loadTags();
            await loadNotes(); // Reload notes to update tag associations
        } catch (error) {
            console.error("Error deleting tag:", error);
            alert("Failed to delete tag. Please try again.");
        }
    };

    const handleSearch = async (query: string, tagId?: number) => {
        try {
            const results = await searchApi.search(query, tagId);
            setSearchResults(results.notes);
            setIsSearchMode(true);
        } catch (error) {
            console.error("Error searching:", error);
            alert("Search failed. Please try again.");
        }
    };

    const handleExportMarkdown = async () => {
        try {
            const data = await exportApi.exportMarkdown();
            const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Don't revoke URL - let browser handle cleanup to ensure download completes
        } catch (error) {
            console.error("Error exporting:", error);
            alert("Export failed. Please try again.");
        }
    };

    const handleExportJSON = async () => {
        try {
            const data = await exportApi.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `daybook_export_${format(new Date(), "yyyyMMdd_HHmmss")}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Don't revoke URL - let browser handle cleanup to ensure download completes
        } catch (error) {
            console.error("Error exporting JSON:", error);
            alert("JSON export failed. Please try again.");
        }
    };

    const handleToggleNoteSelection = (date: string) => {
        setSelectedNotes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(date)) {
                newSet.delete(date);
            } else {
                newSet.add(date);
            }
            return newSet;
        });
    };

    const handleSelectAllNotes = () => {
        setSelectedNotes(new Set(allNotes.map((note) => note.date)));
    };

    const handleClearSelection = () => {
        setSelectedNotes(new Set());
    };

    const handleExportSelected = async () => {
        if (selectedNotes.size === 0) {
            alert("Please select at least one note to export.");
            return;
        }

        try {
            const dates = Array.from(selectedNotes);
            const data = await exportApi.exportSelected(dates);
            const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Don't revoke URL - let browser handle cleanup to ensure download completes
        } catch (error) {
            console.error("Error exporting selected notes:", error);
            alert("Export failed. Please try again.");
        }
    };

    const displayNotes = isSearchMode ? searchResults : allNotes;

    return (
        <div className="app">
            <header className={`app-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
                <div className="header-brand">
                    <img src={logo} alt="DayBook Logo" className="app-logo" />
                    <h1>DayBook</h1>
                </div>
                <div className="header-actions">
                    <Settings
                        onExportMarkdown={handleExportMarkdown}
                        onExportJSON={handleExportJSON}
                    />
                    <ThemeToggle />
                    <TagManager
                        tags={tags}
                        onCreateTag={handleCreateTag}
                        onDeleteTag={handleDeleteTag}
                    />
                </div>
            </header>

            <div className="app-content">
                <aside className="sidebar">
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        noteDates={noteDates}
                    />
                    <div className="sidebar-divider"></div>
                    <NoteSidebar
                        notes={displayNotes}
                        onNoteSelect={handleNoteSelect}
                        selectedDate={selectedDate}
                        selectedNotes={selectedNotes}
                        onToggleNoteSelection={handleToggleNoteSelection}
                        onSelectAll={handleSelectAllNotes}
                        onClearSelection={handleClearSelection}
                        onExportSelected={handleExportSelected}
                    />
                </aside>

                <main className="main-content">
                    <SearchBar onSearch={handleSearch} tags={tags} />
                    {isSearchMode && (
                        <div className="search-info">
                            <p>Found {searchResults.length} note(s)</p>
                            <button
                                onClick={() => {
                                    setIsSearchMode(false);
                                    setSearchResults([]);
                                }}
                                className="btn btn-secondary"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                    <NoteEditor
                        selectedDate={selectedDate}
                        note={currentNote}
                        tags={tags}
                        onSave={handleSaveNote}
                        onDelete={handleDeleteNote}
                    />
                </main>
            </div>
        </div>
    );
}

export default App;
