import React, { useState, useEffect, useContext } from 'react';

// Assume contexts and components are imported
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// e.g., import CustomAlert from '../components/CustomAlert';

import { AuthContext } from './AuthContext'; // Adjust path as needed
import { NavigationContext } from './NavigationContext'; // Adjust path as needed
import CustomAlert from './CustomAlert'; // Adjust path as needed

function LoginPage() {
    const { logInUser, isLoadingAuth, authError, setAuthError } = useContext(AuthContext);
    const { navigateTo } = useContext(NavigationContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formValidationError, setFormValidationError] = useState('');

    // Clear any existing auth errors from context when the component mounts or unmounts
    useEffect(() => {
        if (setAuthError) { // Ensure setAuthError is available
            setAuthError(null); 
        }
        return () => {
            if (setAuthError) {
                setAuthError(null);
            }
        };
    }, [setAuthError]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setFormValidationError(''); // Clear previous local form errors
        if (setAuthError) setAuthError(null); // Clear previous Firebase auth errors from context

        if (!email || !password) {
            setFormValidationError("Email and password are required.");
            return;
        }
        
        const user = await logInUser(email, password); // logInUser from AuthContext handles setting authError on failure
        
        if (user) {
            navigateTo('home'); // Or 'products', or a user-specific dashboard page
        }
        // If login fails, authError in AuthContext will be set, and CustomAlert will display it.
    };

    // Determine which error to display (local form validation takes precedence)
    const displayError = formValidationError || authError;

    return (
        <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Log in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {displayError && (
                        <CustomAlert 
                            message={displayError} 
                            type="error" 
                            onClose={() => {
                                setFormValidationError(''); // Clear local form error
                                if (setAuthError) setAuthError(null); // Clear context auth error
                            }} 
                            duration={5000}
                        />
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address-login" className="sr-only">Email address</label>
                            <input 
                                id="email-address-login" 
                                name="email" 
                                type="email" 
                                autoComplete="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Email address" 
                            />
                        </div>
                        <div>
                            <label htmlFor="password-login" className="sr-only">Password</label>
                            <input 
                                id="password-login" 
                                name="password" 
                                type="password" 
                                autoComplete="current-password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Password" 
                            />
                        </div>
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoadingAuth}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-colors"
                        >
                            {isLoadingAuth ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Log in'
                            )}
                        </button>
                    </div>
                </form>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                        onClick={() => navigateTo('signup')} 
                        className="font-medium text-green-600 hover:text-green-500"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;