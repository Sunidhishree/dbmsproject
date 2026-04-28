import React from 'react'

/**
 * Loading spinner component - red animated spinner
 * Usage: <LoadingSpinner /> or <LoadingSpinner size="lg" />
 */
export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`${sizeClasses[size]} border-4 border-red-pale border-t-red rounded-full animate-spin shadow-sm`}></div>
            {message && <p className="text-gray text-sm font-medium">{message}</p>}
        </div>
    )
}
