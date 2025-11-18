import { useState, useEffect, useMemo, useRef } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import "./NoteEditor.css";
import type { Note, Tag } from "../types";

interface NoteEditorProps {
    selectedDate: Date;
    note: Note | null;
    tags: Tag[];
    onSave: (content: string, tagIds: number[]) => void;
    onDelete: () => void;
}

export default function NoteEditor({
    selectedDate,
    note,
    tags,
    onSave,
    onDelete,
}: NoteEditorProps) {
    const [content, setContent] = useState("");
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Use a ref to store the latest onSave callback without causing re-renders
    const onSaveRef = useRef(onSave);

    // Update ref when onSave changes
    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
        if (note) {
            setContent(note.content);
            setSelectedTags(note.tags.map((t) => t.id));
        } else {
            setContent("");
            setSelectedTags([]);
        }
        setHasChanges(false);
        setIsSaving(false);
    }, [note, selectedDate]);

    // Auto-save effect with 2-second debounce (only for content changes)
    useEffect(() => {
        // Don't auto-save if there are no changes
        if (!hasChanges) {
            return;
        }

        // Don't auto-save if already saving
        if (isSaving) {
            return;
        }

        // For new notes (note === null), only auto-save if there's actual content
        if (!note && !content.trim()) {
            return;
        }

        // For existing notes, only auto-save if content has changed
        if (note && content === note.content) {
            return;
        }

        // Set up debounced auto-save
        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            setSaveStatus('saving');
            try {
                await onSaveRef.current(content, selectedTags);
                setHasChanges(false);
                setSaveStatus('success');
                // Hide success message after 2 seconds
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (error) {
                console.error("Auto-save failed:", error);
                setSaveStatus('error');
                // Hide error message after 3 seconds
                setTimeout(() => setSaveStatus('idle'), 3000);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        // Cleanup: clear timeout if content changes again before 2 seconds
        return () => clearTimeout(timeoutId);
    }, [content, note, hasChanges, isSaving, selectedTags]);

    const handleContentChange = (value: string) => {
        setContent(value);
        setHasChanges(true);
        setIsSaving(false); // Reset saving state when user types
    };

    const handleTagToggle = (tagId: number) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId],
        );
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            await onSave(content, selectedTags);
            setHasChanges(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const editorOptions = useMemo(
        () => ({
            spellChecker: false,
            placeholder: "Write your note here...",
            status: false,
            toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "quote",
                "unordered-list",
                "ordered-list",
                "|",
                "link",
                "image",
                "|",
                "preview",
                "side-by-side",
                "fullscreen",
                "|",
                "guide",
            ] as any,
        }),
        [],
    );

    const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="note-editor">
            {/* Save Status Toast */}
            {saveStatus !== 'idle' && (
                <div className={`save-toast save-toast-${saveStatus}`}>
                    {saveStatus === 'saving' && <span className="toast-icon">💾</span>}
                    {saveStatus === 'success' && <span className="toast-icon">✅</span>}
                    {saveStatus === 'error' && <span className="toast-icon">❌</span>}
                    <span className="toast-message">
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'success' && 'Saved successfully'}
                        {saveStatus === 'error' && 'Save failed'}
                    </span>
                </div>
            )}

            <div className="note-header">
                <h2>{formattedDate}</h2>
                <div className="note-actions">
                    {isSaving && (
                        <span className="saving-indicator">
                            Saving...
                        </span>
                    )}
                    {hasChanges && !isSaving && (
                        <span className="unsaved-indicator">
                            Unsaved changes
                        </span>
                    )}
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            💾 Save
                        </button>
                    )}
                    {note && (
                        <button onClick={onDelete} className="btn btn-danger">
                            🗑️ Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="tags-section">
                <h3>🏷️ Tags:</h3>
                <div className="tags-list">
                    {tags.map((tag) => (
                        <label key={tag.id} className="tag-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedTags.includes(tag.id)}
                                onChange={() => handleTagToggle(tag.id)}
                            />
                            <span className="tag-name">{tag.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="editor-container">
                <SimpleMDE
                    value={content}
                    onChange={handleContentChange}
                    options={editorOptions}
                />
            </div>
        </div>
    );
}
