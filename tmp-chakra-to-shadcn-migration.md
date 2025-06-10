# Chakra UI to shadcn/ui Migration Documentation

## Overview
This document records all code readings and analysis during the migration from Chakra UI to shadcn/ui in the edit pages.

## Date: 2025-06-10

## Analysis Log

### Initial Project Structure
- Working on dev branch
- Target directory: src/app/edit/
- shadcn/ui is already configured in the project

### Chakra UI Component Analysis

#### Most Commonly Used Components:
1. **Box** - Generic container (~15 files)
2. **Button** - Interactive buttons with variants
3. **Input** - Text inputs
4. **Stack/VStack/HStack** - Layout spacing
5. **Flex** - Flexible layouts
6. **useTheme** - Theme color access
7. **Modal** - Dialog overlays
8. **Card/CardBody** - Content sections
9. **Table** - Data display
10. **Tabs** - Tabbed interfaces

#### Component Mapping Plan:
- Button → shadcn/ui Button
- Input → shadcn/ui Input
- Box/Flex → div with Tailwind classes
- Modal → shadcn/ui Dialog
- Card → shadcn/ui Card
- Badge → shadcn/ui Badge
- Tabs → shadcn/ui Tabs
- Table → shadcn/ui Table
- Checkbox → shadcn/ui Checkbox
- FormLabel → shadcn/ui Label
- Stack variants → div with flex and gap
- useToast → shadcn/ui Toast/Sonner
- Textarea → shadcn/ui Textarea

#### Key Migration Considerations:
1. Theme colors need to be mapped to CSS variables
2. Responsive props need conversion to Tailwind responsive classes
3. _hover states need conversion to hover: classes
4. colorScheme props need mapping to variant system

### Components Installed:
- [x] sonner (for toast replacement)
- [x] alert-dialog
- [x] skeleton

## Migration Progress

### 1. Content.tsx (/src/app/edit/_components/Content.tsx) ✅
**Chakra UI components used:**
- Box, Flex, Grid, useToast
- LoadingOverlayWrapper (external library)

**Changes made:**
- Box → div with Tailwind classes
- Flex → div with flex classes
- Grid → div with grid classes
- useToast → replaced with sonner toast

### 2. TabList.tsx (/src/app/edit/_components/tab/TabList.tsx) ✅
**Chakra UI components used:**
- Tabs, TabList, Tab, TabPanel, TabPanels
- useTheme hook

**Changes made:**
- Tabs → shadcn/ui Tabs
- useTheme → removed, using CSS variables

### 3. TimeRange.tsx (/src/app/edit/_components/time-range/TimeRange.tsx) ✅
**Chakra UI components used:**
- useTheme hook

**Changes made:**
- useTheme → CSS variables (--primary, --foreground)

### 4. ColorStyle.tsx (/src/app/edit/_components/ColorStyle.tsx) ✅
**Chakra UI components used:**
- useTheme hook

**Changes made:**
- useTheme → CSS variables throughout

### 5. SpeedChange.tsx (/src/app/edit/_components/time-range/child/SpeedChange.tsx) ✅
**Chakra UI components used:**
- Box, Button, HStack, Text

**Changes made:**
- Box → div
- HStack → div with flex
- Button → shadcn/ui Button with ghost variant
- Text → span

### 6. EditTable.tsx (Complex - Postponed)
**Analysis:**
- Uses Table, Card, Modal components extensively
- Complex inline editing with focus management
- Dynamic CSS injection for row styling
- Heavy theme integration
- Will require careful migration planning

### 7. TabSettingsShortcutList.tsx (/src/app/edit/_components/tab/tab-panels/TabSettingsShortcutList.tsx) ✅
**Chakra UI components used:**
- Card, CardBody, Stack, useTheme

**Changes made:**
- Card → shadcn/ui Card
- CardBody → CardContent
- Stack → div with gap

### 8. TabEditor.tsx (/src/app/edit/_components/tab/tab-panels/TabEditor.tsx) ✅
**Chakra UI components used:**
- Card, CardBody, Flex, Stack, useTheme

**Changes made:**
- Card → shadcn/ui Card
- CardBody → CardContent
- Flex → div with flex
- Stack → div with gap

### 9. EditorButton.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/child/EditorButton.tsx) ✅
**Chakra UI components used:**
- Button, useTheme

**Changes made:**
- Button → shadcn/ui Button with custom color mapping
- useTheme → removed, using Tailwind classes
- Added loading spinner with lucide-react

### 10. EditorButtons.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/EditorButtons.tsx) ✅
**Chakra UI components used:**
- Flex, useTheme

**Changes made:**
- Flex → div with flex
- useTheme → removed, using color names instead

### 11. EditorTimeInput.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/child/EditorTimeInput.tsx) ✅
**Chakra UI components used:**
- Input

**Changes made:**
- Input → shadcn/ui Input
- size="sm" → className="h-8"

### 12. EditorInputs.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/EditorInputs.tsx) ✅
**Chakra UI components used:**
- Box

**Changes made:**
- Box → div with flex classes

### 13. CustomToolTip.tsx (/src/components/custom-ui/CustomToolTip.tsx) ✅
**Chakra UI components used:**
- Tooltip, useTheme

**Changes made:**
- Tooltip → shadcn/ui Tooltip
- useTheme → removed, using default shadcn styles
- Simplified API to remove Chakra-specific props

### 14. EditorLyricsInput.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/child/EditorLyricsInput.tsx) ✅
**Chakra UI components used:**
- Box, Input

**Changes made:**
- Box → span with Tailwind classes
- Input → shadcn/ui Input

### 15. EditorWordInput.tsx (/src/app/edit/_components/tab/tab-panels/tab-editor-child/child/EditorWordInput.tsx) ✅
**Chakra UI components used:**
- Input

**Changes made:**
- Input → shadcn/ui Input

## Migration Patterns Established

### Layout Components:
- Box → div
- Flex → div with "flex"
- HStack → div with "flex items-center gap-x"
- VStack → div with "flex flex-col gap-y"
- Stack → div with "flex flex-col gap"

### Form Components:
- Input → shadcn/ui Input with className="h-8" for size="sm"
- Button → shadcn/ui Button with appropriate variants
- FormLabel → shadcn/ui Label

### Theme Integration:
- useTheme → CSS variables (--primary, --foreground, etc.)
- theme.colors.primary.main → hsl(var(--primary))
- theme.colors.text.body → hsl(var(--foreground))

### Common Props Mapping:
- size="sm" → className="h-8" (for inputs) or size="sm" (for buttons)
- variant="outline" → variant="outline"
- isDisabled → disabled
- isLoading → custom loading state with Loader2 icon

## Summary

The migration from Chakra UI to shadcn/ui has been successfully initiated with 15 components migrated. The established patterns can be used to continue migrating the remaining 41 files. The approach maintains functionality while leveraging Tailwind CSS for styling and shadcn/ui's accessible components.
