import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from "../store/authStore.js";

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const { logout, user, error } = useAuthStore();
    const menuRef = useRef(null);
    const [darkMode, setDarkMode] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await logout();
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        // Check if user has a theme preference stored
        const savedTheme = localStorage.getItem('theme');
        
        // Check if user prefers dark mode at system level
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme based on saved preference or system preference
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else if (prefersDark) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
        
        // Add click event listener to close menu when clicking outside
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setShowMenu(false);
        }
    };

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        // Apply dark mode class to html element
        document.documentElement.classList.toggle('dark', newDarkMode);
        
        // Save preference to localStorage
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    return (
        <nav className="bg-teal-600 dark:bg-gray-800 text-white shadow-lg transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-2">
                        <img 
                            src="/30.jpg" 
                            alt="Logo" 
                            className="size-8 rounded-full object-cover transition-transform duration-300 hover:scale-125" 
                        />
                        <span className="text-xl font-bold">Solaris</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-teal-700 dark:hover:bg-gray-700">Dashboard</Link>
                        <Link to="/optimization" className="px-3 py-2 rounded hover:bg-teal-700 dark:hover:bg-gray-700">Eco Optimizer</Link>
                        <Link to="/stats" className="px-3 py-2 rounded hover:bg-teal-700 dark:hover:bg-gray-700">Statistics</Link>
                        <Link to="/settings" className="px-3 py-2 rounded hover:bg-teal-700 dark:hover:bg-gray-700">Settings</Link>

                        {/* Theme toggle button */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-teal-700 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="px-3 py-2 rounded hover:bg-teal-700 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </button>
                            
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-black ring-opacity-5 z-50">
                                    {/* Logout button */}
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full text-left block px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;