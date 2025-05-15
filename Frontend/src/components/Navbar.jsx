import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {useAuthStore} from "../store/authStore.js"

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const{logout,user,error}=useAuthStore();
    const menuRef = useRef(null);
    const [translations, setTranslations] = useState({
      // Add all text elements that need translation
      language: "Language",
      logout: "Logout",
      dashboard: "Dashboard",
      history: "History",
      statistics: "Statistics",
      settings: "Settings",
      energyMonitor: "Solaris",
      solarStatus: "Energy Status",
      optimizationTools: "Eco Optimizer"
    });
    


    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await logout();
        }catch(err){
        console.log(err)
      }
      }
    // Load language on component mount
    useEffect(() => {
      // Load language and translate if needed
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage && storedLanguage !== 'english') {
        translateContent(storedLanguage);
      }
      
      // Add click event listener to close menu when clicking outside
      document.addEventListener('mousedown', handleClickOutside);
      
      // Listen for page loaded events to handle translation requests
      const handlePageLoaded = (event) => {
        if (event.detail && event.detail.needsTranslation) {
          translateContent(event.detail.language || localStorage.getItem('language'));
        }
      };
      
      window.addEventListener('pageLoaded', handlePageLoaded);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('pageLoaded', handlePageLoaded);
      };
    }, []);
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    const translateContent = async (targetLanguage) => {
      try {
        const apiKey = import.meta.env.VITE_API_GOOGLE;
        if (!apiKey) {
          console.error('Google Translate API key not found');
          return;
        }
        
        // Get current page translations from current page component
        const currentPageTranslationKeys = window.currentPageTranslationKeys || [];
        
        // Common navbar translations that are always needed
        const navbarKeys = ["language", "logout", "dashboard", "history", "statistics", "settings", "energyMonitor", "solarStatus", "optimizationTools"];
        
        // Combine all keys that need translation for this request
        const allKeys = [...navbarKeys, ...currentPageTranslationKeys];
        
        // Get the corresponding English texts
        const sourceTexts = allKeys.map(key => {
          // Check if the key is from navbar
          if (navbarKeys.includes(key)) {
            const navbarDefaultTexts = {
              language: "Language",
              logout: "Logout",
              dashboard: "Dashboard",
              history: "History",
              statistics: "Statistics",
              settings: "Settings",
              energyMonitor: "EcoEnergy",
              solarStatus: "Energy Status",
              optimizationTools: "Eco Optimizer"
            };
            return navbarDefaultTexts[key];
          } 
          // Otherwise, get the text from the current page's default texts
          else if (window.currentPageDefaultTexts && window.currentPageDefaultTexts[key]) {
            return window.currentPageDefaultTexts[key];
          }
          return key; // Fallback to using the key itself
        });
        
        // Map language codes
        const languageMap = {
          english: 'en',
          hindi: 'hi',
          kannada: 'kn'
        };
        
        const targetLang = languageMap[targetLanguage];
        
        // Use Google Translate API
        const url = 'https://translation.googleapis.com/language/translate/v2';
        const response = await fetch(`${url}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: sourceTexts,
            source: 'en',
            target: targetLang,
            format: 'text'
          })
        });
        
        const data = await response.json();
        
        if (data.data && data.data.translations) {
          const translatedTexts = data.data.translations.map(t => t.translatedText);
          
          // Create new translations object with translated text for navbar
          const navbarTranslations = {};
          
          navbarKeys.forEach((key, index) => {
            navbarTranslations[key] = translatedTexts[index];
          });
          
          // Update navbar translations
          setTranslations(navbarTranslations);
          
          // Create page-specific translations
          if (currentPageTranslationKeys.length > 0) {
            const pageTranslations = {};
            
            currentPageTranslationKeys.forEach((key, index) => {
              const translationIndex = navbarKeys.length + index;
              if (translationIndex < translatedTexts.length) {
                pageTranslations[key] = translatedTexts[translationIndex];
              }
            });
    
            // Dispatch a custom event for language change with page translations
            console.log("Dispatching page translations:", pageTranslations);
            window.dispatchEvent(new CustomEvent('languageChange', {
              detail: { 
                language: targetLanguage,
                translations: pageTranslations
              }
            }));
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to English if translation fails
        alert(`Translation failed. Defaulting to English. Error: ${error.message}`);
      }
    };
    
    const changeLanguage = (language) => {
      localStorage.setItem('language', language); // Save to localStorage
      
      if (language !== 'english') {
        translateContent(language);
      } else {
        // Reset to English
        setTranslations({
          language: "Language",
          logout: "Logout",
          dashboard: "Dashboard",
          history: "History",
          statistics: "Statistics",
          settings: "Settings",
          energyMonitor: "EcoEnergy",
          solarStatus: "Energy Status",
          optimizationTools: "Eco Optimizer"
        });
        
        // Reset page translations and maintain backward compatibility
        if (window.currentPageDefaultTexts) {
          const defaultTranslations = { ...window.currentPageDefaultTexts };
          
          // Dispatch event with default translations
          console.log("Dispatching default English translations");
          window.dispatchEvent(new CustomEvent('languageChange', {
            detail: { 
              language: 'english',
              translations: defaultTranslations
            }
          }));
        }
      }
      
      setShowMenu(false);
    };

    return (
        <nav className="bg-teal-600 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <img 
                  src="/30.jpg" 
                  alt="Logo" 
                  className="size-8 rounded-full object-cover transition-transform duration-300 hover:scale-125" 
                />
                <span className="text-xl font-bold">{translations.energyMonitor}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-teal-700">{translations.dashboard}</Link>
                <Link to="/optimization" className="px-3 py-2 rounded hover:bg-teal-700">{translations.optimizationTools}</Link>
                <Link to="/stats" className="px-3 py-2 rounded hover:bg-teal-700">{translations.statistics}</Link>
                <Link to="/settings" className="px-3 py-2 rounded hover:bg-teal-700">{translations.settings}</Link>

           
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="px-3 py-2 rounded hover:bg-teal-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white text-gray-900 ring-1 ring-black ring-opacity-5 z-50">
                      {/* Language section header */}
                      <div className="px-4 py-2 text-xs font-medium border-b border-gray-200 text-teal-700">
                        {translations.language}
                      </div>
                      
                      {/* English language button */}
                      <button
                        onClick={() => changeLanguage('english')}
                        className="w-full text-left block px-4 py-2 text-xs text-teal-700 hover:bg-gray-100"
                      >
                        English
                      </button>
                      
                      {/* Hindi language button */}
                      <button
                        onClick={() => changeLanguage('hindi')}
                        className="w-full text-left block px-4 py-2 text-xs text-teal-700 hover:bg-gray-100"
                      >
                        Hindi
                      </button>
                      
                      {/* Kannada language button */}
                      <button
                        onClick={() => changeLanguage('kannada')}
                        className="w-full text-left block px-4 py-2 text-xs text-teal-700 hover:bg-gray-100"
                      >
                        Kannada
                      </button>
                      
                      {/* Logout divider */}
                      <div className="border-t border-gray-200 mt-2"></div>
                      
                      {/* Logout button */}
                      <button
                          onClick={handleSubmit}
                          className="w-full text-left block px-4 py-2 text-xs text-red-600 hover:bg-gray-100"
                        >
                          {translations.logout}
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