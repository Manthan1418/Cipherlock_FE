# Light Theme Implementation TODO

## Tasks:
- [x] Create TODO.md file
- [x] Create ThemeContext.jsx for theme state management

- [x] Update index.css with CSS variables for both themes

- [x] Update App.jsx to include ThemeProvider

- [x] Update Layout.jsx with theme toggle button

- [x] Update Login.jsx for light theme support

- [x] Update Dashboard.jsx for light theme support

- [x] Update AddPassword.jsx for light theme support

- [x] Update TwoFactorSetup.jsx for light theme support
- [x] Test theme toggle functionality

## Implementation Complete! ✅

### Features Added:
1. **Theme Context** (`ThemeContext.jsx`) - Manages theme state with localStorage persistence
2. **CSS Variables** (`index.css`) - Comprehensive theming system with 30+ CSS variables
3. **Theme Toggle Button** - Located in:
   - Layout navigation (for logged-in users)
   - Login page top-right corner (for auth pages)
4. **Light Theme Colors**:
   - Background: Soft blue-gray (#f8fafc)
   - Cards: White with glass morphism
   - Text: Dark slate (#0f172a)
   - Accents: Indigo (#4f46e5)
   - Particles: Light blue tint

### How to Use:
- Click the sun/moon icon in the navigation to toggle themes
- Theme preference is saved to localStorage
- System preference is respected on first visit
- Smooth transitions between themes (0.3s ease)

### Files Modified:
- `FE/src/context/ThemeContext.jsx` (created)
- `FE/src/index.css` (CSS variables added)
- `FE/src/App.jsx` (ThemeProvider wrapper)
- `FE/src/components/Layout.jsx` (toggle button added)
- `FE/src/pages/Login.jsx` (theme support)
- `FE/src/pages/Dashboard.jsx` (theme support)
- `FE/src/pages/AddPassword.jsx` (theme support)
- `FE/src/pages/TwoFactorSetup.jsx` (theme support)
