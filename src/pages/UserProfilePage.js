import React, { useState, useEffect, useContext, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Assume contexts, db, appId, components are imported
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// e.g., import { db, appId } from '../firebase';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import { UserProfileIcon } from '../components/Icons';

import { AuthContext } from './AuthContext'; // Adjust path as needed
import { NavigationContext } from './NavigationContext'; // Adjust path as needed
import CustomAlert from './CustomAlert'; // Adjust path as needed
import { UserProfileIcon, InfoIcon, ErrorIcon } from './Icons'; // Assuming Icons.js for these
import { db, appId } from './firebase'; // Assuming firebase.js exports db and appId

function UserProfilePage() {
    const { currentUser, userId } = useContext(AuthContext);
    const { navigateTo } = useContext(NavigationContext);
    
    // Initialize profile state with all expected fields
    const [profile, setProfile] = useState({ 
        name: '', 
        address: '', 
        phoneNumber: '' 
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });
    const [formErrors, setFormErrors] = useState({});

    // Corrected path for user profiles, ensuring it's memoized
    const profilePath = useMemo(() => {
        if (!userId || !appId) return null; // Guard against null userId or appId
        return `artifacts/${appId}/users/${userId}/profileData/profile`;
    }, [userId, appId]);

    useEffect(() => {
        if (!userId || (currentUser && currentUser.isAnonymous)) {
            setIsLoading(false);
            navigateTo('login'); 
            return;
        }
        if (!profilePath) { // If profilePath is null (e.g. userId or appId not yet available)
             setIsLoading(false);
             // Potentially show a message or wait, but redirecting if no userId is safer.
             if (!userId) navigateTo('login');
             return;
        }

        const profileDocRef = doc(db, profilePath);
        getDoc(profileDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const fetchedData = docSnap.data();
                // Ensure all profile fields are initialized, even if not in Firestore yet
                setProfile({
                    name: fetchedData.name || currentUser?.displayName || '',
                    address: fetchedData.address || '',
                    phoneNumber: fetchedData.phoneNumber || ''
                });
            } else {
                // If no profile, prefill name from auth if available, others empty
                setProfile({
                    name: currentUser?.displayName || '',
                    address: '',
                    phoneNumber: ''
                });
            }
        }).catch(error => {
            console.error("Error fetching user profile:", error);
            setAlertInfo({ message: "Failed to load profile. " + error.message, type: "error" });
        }).finally(() => {
            setIsLoading(false);
        });
    }, [userId, currentUser, navigateTo, profilePath]); // profilePath is now a dependency

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: ''}));
        }
    };
    
    const validateProfileForm = () => {
        const errors = {};
        if (!profile.name?.trim()) errors.name = "Name is required.";
        if (!profile.address?.trim()) errors.address = "Address is required.";
        if (!profile.phoneNumber?.trim()) {
            errors.phoneNumber = "Phone number is required.";
        } else if (!/^\+?[0-9\s-()]{7,20}$/.test(profile.phoneNumber)) {
            // Basic phone number format validation, can be adjusted
            errors.phoneNumber = "Invalid phone number format.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!userId || !validateProfileForm()) {
             setAlertInfo({ message: "Please correct the errors in the form.", type: "error" });
            return;
        }
        if (!profilePath) {
            setAlertInfo({ message: "Cannot save profile: user path not available.", type: "error" });
            return;
        }
        setIsSaving(true);
        setAlertInfo({ message: "", type: ""}); // Clear previous alerts

        const profileDocRef = doc(db, profilePath);
        try {
            // Ensure all fields are present, even if empty strings, to maintain consistent structure
            const dataToSave = {
                name: profile.name || "",
                address: profile.address || "",
                phoneNumber: profile.phoneNumber || "",
                lastUpdated: serverTimestamp()
            };
            await setDoc(profileDocRef, dataToSave, { merge: true }); // merge: true creates if not exists, updates if exists
            setAlertInfo({ message: "Profile saved successfully!", type: "success" });
        } catch (error) {
            console.error("Error saving profile:", error);
            setAlertInfo({ message: `Failed to save profile: ${error.message}`, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
            </div>
        );
    }

    // This check might be redundant if useEffect handles redirection, but good as a safeguard
    if (!currentUser || currentUser.isAnonymous) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <InfoIcon className="h-16 w-16 text-blue-400 mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Access Denied</h2>
                <p className="text-gray-600 mb-6">Please log in to view and edit your profile.</p>
                <button onClick={() => navigateTo('login')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} />}
            
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center flex items-center justify-center">
                    <UserProfileIcon /> My Profile
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="profile-name" 
                            value={profile.name} 
                            onChange={handleInputChange} 
                            className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`} 
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                        <textarea 
                            name="address" 
                            id="profile-address" 
                            rows="3" 
                            value={profile.address} 
                            onChange={handleInputChange} 
                            className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.address ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`}
                        ></textarea>
                        {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                    </div>
                    <div>
                        <label htmlFor="profile-phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phoneNumber" 
                            id="profile-phoneNumber" 
                            value={profile.phoneNumber} 
                            onChange={handleInputChange} 
                            className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.phoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`}
                        />
                        {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
                    </div>
                    {/* Email field removed as it's managed by auth and not delivery profile */}
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {isSaving ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>Saving...</>
                        ) : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserProfilePage;