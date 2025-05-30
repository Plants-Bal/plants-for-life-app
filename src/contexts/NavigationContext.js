import React, { useState, createContext, useContext } from 'react';

export const NavigationContext = createContext();

export function NavigationProvider({ children }) {
    // Set the initial page, e.g., 'home' or 'products'
    const [currentPage, setCurrentPage] = useState('home'); 
    
    // 'pageData' can be used to pass simple data during navigation, 
    // e.g., an ID to an item detail page, though we haven't used it extensively yet.
    const [pageData, setPageData] = useState(null); 

    const navigateTo = (page, data = null) => {
        setCurrentPage(page);
        setPageData(data);
        // Scroll to top on page navigation for better UX
        window.scrollTo(0, 0); 
    };

    const contextValue = {
        currentPage,
        pageData,
        navigateTo
    };

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    );
}

// Optional: Custom hook to use the navigation context
export const useNavigation = () => {
  return useContext(NavigationContext);
};