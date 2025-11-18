import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
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
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [content, setContent] = useState("");

    // Use a ref to store the latest onSave callback without causing re-renders
    const onSaveRef = useRef(onSave);

    // Update ref when onSave changes
    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    // Initialize Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: "Write your note here...",
            }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "tiptap-editor",
            },
        },
        onUpdate: ({ editor }) => {
            const markdown = editorToMarkdown(editor.getHTML());
            setContent(markdown);
            setHasChanges(true);
            setIsSaving(false);
        },
    });

    // Convert HTML to Markdown (simplified converter for common elements)
    const editorToMarkdown = (html: string): string => {
        let markdown = html;

        // Remove wrapping <p> tags
        markdown = markdown.replace(/<p>/g, '');
        markdown = markdown.replace(/<\/p>/g, '\n\n');

        // Convert headings
        markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
        markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
        markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
        markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n');
        markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1\n');
        markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1\n');

        // Convert strong/bold
        markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');

        // Convert em/italic
        markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
        markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');

        // Convert code
        markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

        // Convert blockquote
        markdown = markdown.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1\n');
        markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n');

        // Convert links
        markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

        // Convert unordered lists
        markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (_match, content) => {
            return content.replace(/<li><p>(.*?)<\/p><\/li>/g, '- $1\n')
                          .replace(/<li>(.*?)<\/li>/g, '- $1\n');
        });

        // Convert ordered lists
        markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (_match, content) => {
            let counter = 1;
            return content.replace(/<li><p>(.*?)<\/p><\/li>/g, () => `${counter++}. $1\n`)
                          .replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`);
        });

        // Convert task lists
        markdown = markdown.replace(/<ul data-type="taskList">(.*?)<\/ul>/gs, (_match, content) => {
            return content.replace(/<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span><\/span><\/label><div><p>(.*?)<\/p><\/div><\/li>/g, '- [x] $1\n')
                          .replace(/<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div><p>(.*?)<\/p><\/div><\/li>/g, '- [ ] $1\n')
                          .replace(/<li data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div><p>(.*?)<\/p><\/div><\/li>/g, '- [ ] $1\n')
                          .replace(/<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span><\/span><\/label><div>(.*?)<\/div><\/li>/g, '- [x] $1\n')
                          .replace(/<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div>(.*?)<\/div><\/li>/g, '- [ ] $1\n')
                          .replace(/<li data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div>(.*?)<\/div><\/li>/g, '- [ ] $1\n');
        });

        // Convert code blocks
        markdown = markdown.replace(/<pre><code class="language-(.*?)">(.*?)<\/code><\/pre>/gs, '```$1\n$2\n```\n');
        markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n');

        // Convert horizontal rule
        markdown = markdown.replace(/<hr>/g, '---\n');

        // Convert line breaks
        markdown = markdown.replace(/<br\s*\/?>/g, '\n');

        // Clean up extra newlines
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        markdown = markdown.trim();

        return markdown;
    };

    // Convert Markdown to HTML (simplified converter for common elements)
    const markdownToHtml = (markdown: string): string => {
        let html = markdown;

        // Convert headings
        html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
        html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
        html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

        // Convert task lists (must be before regular lists)
        html = html.replace(/^- \[x\]\s+(.*)$/gm, '<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>$1</p></div></li>');
        html = html.replace(/^- \[ \]\s+(.*)$/gm, '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>$1</p></div></li>');

        // Wrap task list items
        html = html.replace(/(<li data-type="taskItem".*?<\/li>\n?)+/g, '<ul data-type="taskList">$&</ul>');

        // Convert unordered lists
        html = html.replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>(?!.*data-type).*?<\/li>\n?)+/g, '<ul>$&</ul>');

        // Convert ordered lists
        html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');

        // Convert bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Convert italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Convert inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Convert links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Convert blockquotes
        html = html.replace(/^>\s+(.*)$/gm, '<blockquote><p>$1</p></blockquote>');

        // Convert code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
            if (lang) {
                return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
            }
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Convert horizontal rule
        html = html.replace(/^---$/gm, '<hr>');

        // Convert paragraphs (lines not already wrapped)
        const lines = html.split('\n');
        const wrappedLines = lines.map(line => {
            if (line.trim() === '') return '';
            if (line.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|div)/)) return line;
            return `<p>${line}</p>`;
        });
        html = wrappedLines.join('\n');

        // Clean up
        html = html.replace(/\n{2,}/g, '\n');

        return html;
    };

    // Update editor content when note changes
    useEffect(() => {
        if (note) {
            const htmlContent = markdownToHtml(note.content);
            editor?.commands.setContent(htmlContent);
            setContent(note.content);
            setSelectedTags(note.tags.map((t) => t.id));
        } else {
            editor?.commands.setContent("");
            setContent("");
            setSelectedTags([]);
        }
        setHasChanges(false);
        setIsSaving(false);
    }, [note, selectedDate, editor]);

    // Auto-save effect with 2-second debounce
    useEffect(() => {
        if (!hasChanges || isSaving) {
            return;
        }

        if (!note && !content.trim()) {
            return;
        }

        if (note && content === note.content) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            setSaveStatus('saving');
            try {
                await onSaveRef.current(content, selectedTags);
                setHasChanges(false);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (error) {
                console.error("Auto-save failed:", error);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [content, note, hasChanges, isSaving, selectedTags]);

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

    const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Toolbar button handlers
    const toggleBold = () => editor?.chain().focus().toggleBold().run();
    const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
    const toggleHeading = (level: 1 | 2 | 3) =>
        editor?.chain().focus().toggleHeading({ level }).run();
    const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
    const toggleTaskList = () => editor?.chain().focus().toggleTaskList().run();
    const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
    const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
    const setHorizontalRule = () => editor?.chain().focus().setHorizontalRule().run();

    if (!editor) {
        return <div>Loading editor...</div>;
    }

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

            {/* Tiptap Toolbar */}
            <div className="editor-toolbar">
                <button
                    onClick={toggleBold}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </button>
                <button
                    onClick={toggleItalic}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </button>
                <span className="separator">|</span>
                <button
                    onClick={() => toggleHeading(1)}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title="Heading 1"
                >
                    H1
                </button>
                <button
                    onClick={() => toggleHeading(2)}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    onClick={() => toggleHeading(3)}
                    className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                    title="Heading 3"
                >
                    H3
                </button>
                <span className="separator">|</span>
                <button
                    onClick={toggleBulletList}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                    title="Bullet List"
                >
                    • List
                </button>
                <button
                    onClick={toggleOrderedList}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                    title="Numbered List"
                >
                    1. List
                </button>
                <button
                    onClick={toggleTaskList}
                    className={editor.isActive('taskList') ? 'is-active' : ''}
                    title="Task List"
                >
                    ✓ Tasks
                </button>
                <span className="separator">|</span>
                <button
                    onClick={toggleBlockquote}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title="Quote"
                >
                    &quot;
                </button>
                <button
                    onClick={toggleCodeBlock}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                    title="Code Block"
                >
                    &lt;/&gt;
                </button>
                <button
                    onClick={setHorizontalRule}
                    title="Horizontal Rule"
                >
                    ―
                </button>
            </div>

            <div className="editor-container">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
