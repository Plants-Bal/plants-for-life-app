// helpers.js

/**
 * Formats a numeric price into a currency string with the Philippine Peso symbol.
 * @param {number} price - The price to format.
 * @returns {string} - The formatted price string (e.g., "₱150.00").
 */
export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        // console.warn("Invalid price passed to formatPrice:", price);
        return `₱0.00`; // Or handle error as appropriate
    }
    return `₱${Number(price).toFixed(2)}`;
};

/**
 * Formats a Firestore timestamp object (or any object with a 'seconds' property) 
 * into a readable date and time string.
 * @param {object} timestamp - The timestamp object (e.g., { seconds: 1620000000, nanoseconds: 0 }).
 * @returns {string} - The formatted date string (e.g., "May 3, 2021, 08:00 AM") or "N/A".
 */
export const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
        // console.warn("Invalid timestamp passed to formatDate:", timestamp);
        return 'N/A';
    }
    try {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            // timeZone: 'Asia/Manila' // Optional: Specify timezone if needed for consistency
        });
    } catch (error) {
        console.error("Error formatting date:", error, "Timestamp was:", timestamp);
        return 'Invalid Date';
    }
};

/**
 * Generates a somewhat unique order number string.
 * Format: PFL-{last 6 digits of timestamp}-{random 4 char alphanumeric string}
 * @returns {string} - The generated order number.
 */
export const generateOrderNumber = () => {
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `PFL-${timestampPart}-${randomPart}`;
};

// You can add other general utility functions here as your application grows.
// For example, a function to truncate text:
// export const truncateText = (text, maxLength) => {
//   if (text.length <= maxLength) return text;
//   return text.substr(0, maxLength) + '...';
// };