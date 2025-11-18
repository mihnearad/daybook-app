# Changelog

All notable changes to DayBook will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-11-18

### Added
- **Real-time WYSIWYG Markdown Editor**: Replaced SimpleMDE with Tiptap editor for live markdown rendering (Obsidian-style)
  - Type `**text**` + space → renders as **text** (bold) instantly
  - Type `*text*` + space → renders as *text* (italic) instantly
  - Type `# Heading` + space → renders as heading with proper size
  - Interactive task lists with clickable checkboxes (`- [ ] task` → checkbox)
  - All markdown syntax renders live (links, lists, quotes, code blocks, etc.)
  - Custom toolbar with active state indicators for bold, italic, headings, lists, tasks, etc.
  - Reduced bundle size from ~700KB to 577KB (17% reduction)
  - Full theme compatibility with light/dark modes
  - Preserved all existing features (auto-save, tag selection, markdown export)
- Added purple and teal color themes to CSS variables for better UI variety
- Added shadow variables for purple and teal colors (light and dark modes)
- Added useMemo optimization to Calendar component for better performance

### Changed
- **Major Editor Upgrade**: Replaced SimpleMDE/EasyMDE (CodeMirror 5) with Tiptap (ProseMirror) for modern WYSIWYG editing
  - Removed dependencies: `easymde` (2.20.0), `react-simplemde-editor` (5.2.0)
  - Added dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-placeholder`
  - Completely rewrote NoteEditor.tsx (~460 lines) with new Tiptap implementation
  - Redesigned editor CSS with Tiptap-specific styling while maintaining theme system
  - Implemented custom HTML ↔ Markdown converters for seamless data persistence
  - Increased base text size to 18px for better readability
  - Scaled all heading sizes proportionally (H1: 32px, H2: 28px, H3: 24px, H4: 21px, H5/H6: 19px)
  - Improved task list alignment with centered checkboxes
- Migrated from `network_mode: host` to standard Docker port mapping in docker-compose.yml for better flexibility and portability
- Updated docker-compose.yml to use standard `"HOST:CONTAINER"` port format (3000:80 for frontend, 8000:8000 for backend)
- Changed nginx to listen on standard port 80 inside container (mapped to host port via docker-compose.yml)
- Redesigned Tag Manager button with purple color scheme (works beautifully in both light and dark modes)
- Redesigned Settings button with teal color scheme (avoids gray which looked poor in dark mode)
- Improved button color contrast and visibility across all themes
- Simplified handleDeleteNote function - removed redundant manual state update, now relies solely on loadNotes()

### Fixed
- **CRITICAL FIX**: Fixed timezone bug causing notes to appear on wrong calendar dates - Calendar.tsx was using `toISOString()` which converts to UTC, while note creation used local time via date-fns. Now consistently using `format(date, 'yyyy-MM-dd')` from date-fns throughout the app to avoid timezone conversions
- **CRITICAL FIX**: Fixed calendar note indicators not updating correctly after deletion - converted renderCalendar to useMemo with proper dependencies (currentMonth, selectedDate, noteDates) to ensure React re-renders when notes change
- **CRITICAL FIX**: Fixed calendar navigation arrows emoji issue - root cause was CSS ::before pseudo-elements using emoji (⬅️ ➡️). Replaced with plain text < > in CSS with explicit font-family to prevent emoji rendering
- Fixed Clear button in dark mode - changed from inverted colors to theme-aware colors with red hover state
- Fixed search bar focus state - removed translateY transform and added proper z-index to prevent blue highlight clipping
- Fixed tag dropdown styling - removed native macOS appearance and added custom styled dropdown with chevron icon
- Fixed task list checkbox alignment - text now centers properly with checkboxes
- Reorganized header menu items in logical order: Tag Manager → Settings → Theme Toggle
- Removed translucent backdrop overlay from Settings and TagManager panels for cleaner UI

## [1.1.0] - 2025-11-18

### Added - UI/UX Modernization (Apple-inspired fluid design)

**Animation System Foundation:**
- ✅ Comprehensive animation system with timing functions and easing curves
- ✅ 5-level elevation system with theme-aware shadows (--elevation-0 to --elevation-5)
- ✅ Blur scale and radius scale for glass morphism effects
- ✅ Backdrop blur backgrounds for light and dark modes
- ✅ Accessibility support with `prefers-reduced-motion` media query

**Header & Navigation:**
- ✅ Floating header with macOS-style backdrop blur (theme-aware transparency)
- ✅ Scroll-based header elevation with smooth shadow transitions
- ✅ Logo hover animation with scale and rotation
- ✅ Staggered header actions entrance animation

**Calendar Enhancements:**
- ✅ Calendar day hover animations with scale, lift, and ripple effects
- ✅ Pulsing note indicators with glow animation
- ✅ Month transition with slide-fade animation
- ✅ Today's date subtle pulse animation with border color fade
- ✅ Selected date pop animation with spring effect
- ✅ Calendar navigation arrows with emoji (⬅️ ➡️) and rotation animation

**Note Editor Improvements:**
- ✅ Save status toast notifications with emojis (💾 Saving, ✅ Success, ❌ Error)
- ✅ Floating toast with backdrop blur and slide-up animation
- ✅ Custom animated checkboxes with checkmark pop effect
- ✅ Tag selection micro-interactions with smooth transitions
- ✅ Button spring animations with active states
- ✅ Delete button wobble animation on hover
- ✅ Save button with emoji (💾 Save) and spring effect

**Sidebar Animations:**
- ✅ Staggered note list animations (fade-slide entrance)
- ✅ Note item hover with translate + scale effects
- ✅ Selected note pulse animation
- ✅ Smooth scroll behavior with custom scrollbar styling

**SearchBar Enhancements:**
- ✅ Search input with emoji icon (🔍) that animates on focus
- ✅ Tag filter with emoji icon (🏷️) that scales on focus
- ✅ Floating elevation on focus with enhanced shadow
- ✅ Search info banner slide-down animation with search emoji
- ✅ Clear button shake animation on hover
- ✅ Button ripple effects on click

**Theme Toggle:**
- ✅ Replaced SVG icons with emoji (☀️ for light, 🌙 for dark)
- ✅ Icon rotation animation on theme change (180deg spin)
- ✅ Icon pulse animation on hover
- ✅ Enhanced button elevation and spring physics

**TagManager Modal:**
- ✅ Backdrop overlay with blur effect
- ✅ Modal slide-down-scale entrance animation
- ✅ Staggered tag item animations on open
- ✅ Close button with rotation animation (90deg spin)
- ✅ Delete button hover with rotate and wobble effect
- ✅ Custom scrollbar styling for tag list
- ✅ Comprehensive emoji usage (🏷️ for tags, 🗑️ for delete, 📋 for list)

**Settings Panel:**
- ✅ Backdrop overlay with blur effect
- ✅ Panel slide-down-scale entrance animation
- ✅ Structured export buttons with icon + title + subtitle layout
- ✅ Button ripple effects on click
- ✅ Enhanced hint box with left border accent
- ✅ Close button with rotation animation
- ✅ Emoji indicators (⚙️ Settings, 📦 Export, 📄 Markdown, 📋 JSON, 💡 Tip)

**Comprehensive Emoji System:**
- 🔍 Search functionality
- 📅 Calendar and dates
- 💾 Save operations
- 🗑️ Delete actions
- ✅ Success states
- ❌ Error states
- 🏷️ Tags
- ⬅️➡️ Navigation
- ⚙️ Settings
- 📦 Export/Backup
- 📄 Markdown files
- 📋 JSON/Lists
- 💡 Tips and hints
- ☀️🌙 Light/Dark theme
- ✖️ Close actions
- ➕ Add actions

### Changed - Design System Updates
- Updated all border radius values to use new scale (--radius-xs to --radius-2xl)
- Enhanced all shadows to use 5-level elevation system (theme-aware)
- Implemented backdrop blur with saturation for glass morphism effects
- Improved all button interactions with spring physics
- Enhanced focus states with smooth glow transitions
- Updated all transitions to use new timing functions (ease-out-expo, ease-out-back, ease-in-out-smooth, ease-spring)
- Added animation durations scale (instant: 100ms, fast: 200ms, normal: 300ms, slow: 400ms, slower: 600ms)
- Smooth scroll behavior across all scrollable containers
- Performance optimized with `will-change` for frequent animations
- Dark mode enhancements with stronger shadows and adjusted blur backgrounds

### Added
- Added Settings component with export options for full backup (Markdown and JSON formats)
- Added selective note export feature - users can now select specific notes to export
- Added checkboxes to NoteSidebar for selecting individual notes
- Added "Export Selected" button that appears when notes are selected
- Added "Select All" and "Clear" buttons in NoteSidebar for bulk selection management
- Added new backend endpoint POST /api/export/markdown/selected for exporting selected notes
- Added ExportSelectedRequest schema for backend validation

### Changed
- Replaced standalone "Export Notes" button with comprehensive Settings panel
- Reorganized header actions - Settings now appears first, followed by Theme Toggle and Tag Manager
- Export functionality now accessible through Settings panel with clear categorization
- NoteSidebar now displays selection controls and selected note count

### Fixed
- Fixed download completion issue (.crdownload files remaining unconfirmed):
  - Changed MIME type from `text/markdown` to `text/plain;charset=utf-8` for better browser compatibility
  - Append anchor element to DOM before triggering download (required by some browsers)
  - Removed URL.revokeObjectURL() call - let browser garbage collect blob URLs naturally
  - This prevents premature blob URL revocation that was interrupting downloads
- Downloads now complete successfully in all export formats (Markdown, JSON, Selected)

## [1.0.1] - 2025-11-17

### Added
- Added custom DayBook calendar logo as favicon and app icon
- Added DayBook logo to navbar/header for better branding
- Created web manifest for PWA support (allows app installation on mobile/desktop)
- Added meta tags for better SEO and app description

### Changed
- Updated to cleaner, unified Calendar_DayBookLogo design
- Increased navbar logo size from 40px to 56px for better visibility
- Improved logo vertical alignment with navbar text
- Simplified logo implementation (single universal logo for both themes)

### Fixed
- Fixed auto-save feature TDZ (Temporal Dead Zone) error caused by function initialization order
- Fixed auto-save timer being reset unnecessarily when parent component re-renders
- Fixed backend server dependency installation and virtual environment setup
- Improved React hooks dependency management for stable callback references

### Changed
- Wrapped `loadNoteForDate` in `useCallback` for proper React hooks behavior
- Used `useRef` pattern in NoteEditor to maintain stable `onSave` callback reference
- Updated auto-save effect to prevent timer resets on parent re-renders

## [1.0.0] - 2025-11-17

### Added
- Initial release with daily note-taking functionality
- Calendar view with note indicators
- Markdown editor with SimpleMDE
- Tag management system
- Full-text search with tag filtering
- Light/dark theme support with persistent preference
- Export notes to markdown
- Auto-save feature with 2-second debounce
- FastAPI backend with SQLite database
- React/TypeScript frontend with Vite
