# Agent Constitution: Screen AI "Gemini S-Tier"

## 1. Technology Stack (Strict)
- **Runtime**: Electron (TypeScript + Vite)
- **Frontend**: React
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide-React

## 2. Design System: "Gemini S-Tier"
- **Standards**: Google Material 3 Desktop.
- **Surface**:
  - Background: `bg-neutral-900/90` (Obsidian)
  - Blur: `backdrop-blur-3xl`
  - Corner Radius: **32px** (Strict for main panels).
- **The Gemini Glow**:
  - **Implementation**: Layered Conic Gradient behind the content.
  - **Palette**:
    - Interdimensional Blue: `#2A1AD8`
    - Blue-Violet: `#7231EC`
    - Lavender Indigo: `#953DF5`
  - **Animation**: `animate-spin-slow` (Kinetic Rotation).
- **Typography**: Inter (Google Sans approximation), "Display" weights for headers, high-contrast inputs.

## 3. Architecture: State Persistence (CRITICAL)
- **The Golden Rule**: **NEVER destroy the React component tree when switching view modes.**
- **Implementation**:
  - Use a **Single-Window Morphing** strategy.
  - **Compact Mode**: Small pill (60px height).
  - **Expanded Mode**: Large canvas (600px height).
  - **Transition**: Use standard Electron `win.setBounds()` or `win.setSize()` combined with Framer Motion `<motion.div layout>` in React to fluidly animate the DOM to the new window size.
  - **Forbidden**: Do not use `BrowserWindow` creation/destruction for mode switching. Do not use multi-window architectures that sever the React state.

## 4. Code Style
- **Functional Components**: Strict React Functional Components (RFC).
- **TypeScript**: Strict typing where possible (or PropType equivalents if JS).
- **Modularity**: "Content is Sacred" — logic must be decoupled from the view.
- **Performance**: Use `useMemo` and `useCallback` for expensive render cycles.

## 5. Security & Isolation
- **Context Isolation**: `contextIsolation: true` in Electron Main.
- **IPC**: Use `ipcMain.handle` and `ipcRenderer.invoke` for type-safe communication.
- **Localhost Only**: Assume AI backend runs on `localhost:8000` via WebSocket/REST.
