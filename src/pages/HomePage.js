import React, { useContext } from 'react';

// Assume NavigationContext is defined in its own file and imported
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// For this example, we'll assume direct import or it's passed via props if not using context directly in this isolated view
// In our full app, it's: import { NavigationContext } from './NavigationContext'; (adjust path as needed)
import { NavigationContext } from './NavigationContext'; // Or wherever you define/import it

// Assume TreeIcon is in its own file or a shared components file
// e.g., import { TreeIcon } from '../components/Icons';
// For this example, the TreeIcon component definition is included for self-containment.
const TreeIcon = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 sm:w-40 sm:h-40 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.44 15.05A6 6 0 0110 4.002v11.996a6.002 6.002 0 01-5.56-8.948zM10 15.998V4.002a6.002 6.002 0 015.56 8.948A6 6 0 0110 15.998z" clipRule="evenodd" />
        <path d="M10 4C7.791 4 6 5.791 6 8c0 1.888.954 3.533 2.394 4.472A.75.75 0 009 12.25v3a.75.75 0 001.5 0v-3a.75.75 0 00.606-.722C13.046 11.533 14 9.888 14 8c0-2.209-1.791-4-4-4zm0 1.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </svg>
);

// Assume APP_NAME is imported from a constants file or defined globally
// For this example:
const APP_NAME = "Plants for Life";

function HomePage() {
    const { navigateTo } = useContext(NavigationContext);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-18rem)]"> {/* Adjusted min-height to account for nav/footer */}
            <TreeIcon /> 
            <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-6 mt-8"> 
                Welcome to <span className="block sm:inline">{APP_NAME}!</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
                {APP_NAME} sells plants and seeds sourced from local plant enthusiasts, bringing nature's beauty right to your doorstep.
            </p>
            <button
                onClick={() => navigateTo('products')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-10 rounded-lg shadow-md hover:shadow-lg transition-all text-lg"
            >
                Shop Our Collection
            </button>
        </div>
    );
}

export default HomePage;