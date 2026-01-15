# Implementation Plan - Collapsible Sidebar

To improve screen real estate, we will add a collapse/expand feature to the sidebar navigation.

## Proposed Changes

### Frontend
#### [MODIFY] [AdminLayout.js](file:///c:/Users/flemi/OneDrive/Desktop/gitt/screenai/frontend/src/components/AdminLayout.js)
- Import `PanelLeftClose`, `PanelLeftOpen` from `lucide-react`.
- Add state `const [isCollapsed, setIsCollapsed] = useState(false);`.
- Add a toggle button in the sidebar header (next to ScreenAI logo).
- Update `<aside>` props:
    - Change width class conditionally: `w-72` (expanded) vs `w-20` (collapsed).
    - Add transition utility classes.
- Update "Compose Job" button:
    - Show full button when expanded.
    - Show only `Plus` icon circle when collapsed.
- Update Navigation Links:
    - Hide text `<span>` when collapsed.
    - Center icons when collapsed.
- Update User Profile:
    - Hide Name/Email when collapsed.
    - Show only Avatar when collapsed.

## Verification Plan

### Manual Verification
1.  **Click Toggle**: Click the new collapse button in the sidebar header.
2.  **Verify Collapsed State**:
    - Sidebar width shrinks to `80px` (w-20).
    - "ScreenAI" text disappears.
    - "Compose Job" becomes a small square/circle button.
    - Nav links show only icons, centered.
    - User profile shows only avatar.
3.  **Click Toggle Again**: Sidebar expands to full width, text reappears.
4.  **Navigation**: Ensure links still work in both states.
