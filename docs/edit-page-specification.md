# Edit Page Specification

## Overview
The Edit page is a comprehensive interface for creating and editing typing game maps. It allows users to synchronize lyrics with YouTube videos and configure various typing options.

## Main Components

### 1. Layout Structure
- **Main Container**: Responsive layout with different widths for various screen sizes
- **Three Main Sections**:
  1. YouTube Player and Tab Interface (top)
  2. Time Range Slider (middle)
  3. Edit Table (bottom)

### 2. YouTube Player Section
- **Location**: Top-left of the page
- **Features**:
  - Embedded YouTube player for video playback
  - Fixed aspect ratio (16:9)
  - Responsive sizing

### 3. Tab Interface
- **Location**: Top-right of the page
- **Three Tabs**:
  1. **情報 & 保存 (Info & Save)**: Map metadata and upload functionality
  2. **エディター (Editor)**: Bulk editing tools for lyrics and words
  3. **設定 & ショートカットキー (Settings & Shortcuts)**: Configuration options and keyboard shortcuts

### 4. Time Range Slider
- **Purpose**: Visual timeline for navigating through the video
- **Features**:
  - Synchronized with YouTube player
  - Click/drag to seek to specific time
  - Visual progress indicator

### 5. Edit Table
- **Structure**:
  - **Time Column**: Timestamp for each line
  - **歌詞 (Lyrics) Column**: Display text/lyrics
  - **ワード (Word) Column**: Typing text
  - **オプション (Options) Column**: Line-specific settings
- **Features**:
  - Direct inline editing by clicking cells
  - Row selection and highlighting
  - Current time indicator
  - Option modal for advanced settings per line

## Key Functionality

### Line Editing
- **Direct Edit Mode**: Click on any cell to edit inline
- **Time Input**: 
  - Number input with 0.05s increment/decrement using arrow keys
  - Enter key seeks to that time
- **Lyrics Input**:
  - Text input with Ruby tag support
  - Enter key adds Ruby tags to selected text
- **Word Input**:
  - Text input with conversion button
  - Auto-conversion from lyrics to romaji

### Options Modal
Each line can have custom options:
- **CSS Styling**: Custom CSS for individual lines
- **Speed Changes**: Video playback speed modifications
- **Eternal CSS**: Persistent styling options

### Keyboard Shortcuts
- Various keyboard shortcuts for efficient editing
- Customizable in the Settings tab

## UI Migration Status (as of 2025-06-10)

### Migrated from Chakra UI to shadcn/ui:
✅ Main layout components
✅ Tab navigation
✅ Table components
✅ Basic form inputs
✅ Tooltip system
✅ Loading overlay

### Still Using Chakra UI:
- Modal components (LineOptionModal)
- Tab panel content components
- Various form components in tab panels
- Complex layout components in tab content

## Technical Details

### State Management
- Uses Jotai for atomic state management
- Separate atoms for:
  - Map data
  - UI state (selected lines, edit mode)
  - YouTube player state
  - Form values

### Data Flow
1. Map data loaded from API or backup
2. Changes tracked in local state
3. Upload functionality saves to server
4. Auto-backup to IndexedDB

### Styling
- Transitioning from Chakra UI theme to Tailwind CSS
- Custom theme colors maintained for consistency
- Responsive design with mobile considerations

## Future Improvements
1. Complete migration from Chakra UI to shadcn/ui
2. Enhanced keyboard navigation
3. Undo/redo functionality
4. Real-time collaboration features
5. Advanced timing adjustment tools