import React from 'react';

// Ideally, ORDER_STATUSES would be imported from a shared constants file
// e.g., import { ORDER_STATUSES } from '../constants';
// For this example, we'll define it here for self-containment.
const ORDER_STATUSES = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

function StatusTracker({ currentStatus }) {
    const currentStatusIndex = ORDER_STATUSES.indexOf(currentStatus);
    // If status is "Cancelled", it's a final state, don't show other steps as active in the same way.
    const isCancelled = currentStatus === "Cancelled";

    return (
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 w-full justify-between md:justify-start">
            {ORDER_STATUSES.map((status, index) => {
                // Logic to decide whether to display a step based on cancellation
                if (isCancelled && status !== "Cancelled") {
                    // If the order is cancelled, only show the "Cancelled" step prominently
                    // Optionally, show previous steps as greyed out or not at all
                    return null; // Or render a greyed out version if desired
                }
                if (!isCancelled && status === "Cancelled") {
                    // If the order is not cancelled, don't show the "Cancelled" step in the normal flow
                    return null;
                }
                
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                let dotColorClass = "bg-gray-300"; // Default for future steps
                let textColorClass = "text-gray-500";

                if (isCancelled) { // This will only be true for the "Cancelled" status itself now
                    dotColorClass = "bg-red-500";
                    textColorClass = "font-semibold text-red-700";
                } else if (isActive) {
                    dotColorClass = "bg-green-500"; // Active/completed steps
                    textColorClass = "font-semibold text-gray-700";
                }
                
                // Specific styling for the current active step (if not cancelled)
                if (isCurrent && !isCancelled) {
                    textColorClass = "font-bold text-green-600";
                }


                return (
                    <div key={status} className="flex flex-col items-center text-center min-w-[70px] sm:min-w-[90px] md:min-w-[100px]">
                        <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${dotColorClass} mb-1.5 transition-colors`}></div>
                        <p className={`text-xs ${textColorClass}`}>
                            {status}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

export default StatusTracker;