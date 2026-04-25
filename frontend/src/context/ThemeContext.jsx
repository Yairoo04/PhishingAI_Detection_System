import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const themes = {
    dark: {
        bg: '#0a0a0b',
        bgCard: '#111114',
        bgCard2: '#16161a',
        bgInput: '#0f172a',
        panelBg: '#111114',
        text: '#f8fafc',
        textSub: '#e2e8f0',
        textMuted: '#94a3b8',
        textDim: '#64748b',
        textFaint: '#475569',
        border: '#1e293b',
        tableBorder: '#1e293b',
        inputBorder: '#334155',
        gridLine: 'rgba(255,255,255,0.03)',
        badgeBg: '#1e293b',
        // Navbar-specific
        navbarScrollBg: 'rgba(10,10,11,0.85)',
        navbarScrollBorder: 'rgba(255,255,255,0.08)',
        navbarScrollShadow: '0 8px 32px rgba(0,0,0,0.45)',
        navBtnBg: 'rgba(255,255,255,0.05)',
        navBtnBorder: 'rgba(255,255,255,0.10)',
        navBtnHover: 'rgba(255,255,255,0.10)',
        navDropdownBorder: 'rgba(255,255,255,0.08)',
        navItemHover: 'rgba(255,255,255,0.05)',
        mobileLinkBg: 'rgba(255,255,255,0.04)',
        mobileLinkBorder: 'rgba(255,255,255,0.06)',
    },
    light: {
        bg: '#f8fafc',
        bgCard: '#ffffff',
        bgCard2: '#f1f5f9',
        bgInput: '#ffffff',
        panelBg: '#f1f5f9',
        text: '#0f172a',
        textSub: '#334155',
        textMuted: '#475569',
        textDim: '#64748b',
        textFaint: '#94a3b8',
        border: '#e2e8f0',
        tableBorder: '#f1f5f9',
        inputBorder: '#cbd5e1',
        gridLine: 'rgba(0,0,0,0.05)',
        badgeBg: '#f1f5f9',
        // Navbar-specific
        navbarScrollBg: 'rgba(248,250,252,0.92)',
        navbarScrollBorder: 'rgba(0,0,0,0.08)',
        navbarScrollShadow: '0 8px 32px rgba(0,0,0,0.10)',
        navBtnBg: 'rgba(0,0,0,0.04)',
        navBtnBorder: 'rgba(0,0,0,0.10)',
        navBtnHover: 'rgba(0,0,0,0.08)',
        navDropdownBorder: 'rgba(0,0,0,0.08)',
        navItemHover: 'rgba(0,0,0,0.04)',
        mobileLinkBg: 'rgba(0,0,0,0.03)',
        mobileLinkBorder: 'rgba(0,0,0,0.07)',
    }
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('phishing_detector_theme');
        return saved ? JSON.parse(saved) : true;
    });

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    useEffect(() => {
        localStorage.setItem('phishing_detector_theme', JSON.stringify(darkMode));
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
        // Also set body directly so it transitions smoothly even before CSS classes kick in
        document.body.style.backgroundColor = darkMode ? themes.dark.bg : themes.light.bg;
        document.body.style.color = darkMode ? themes.dark.text : themes.light.text;
    }, [darkMode]);

    const theme = darkMode ? themes.dark : themes.light;

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
