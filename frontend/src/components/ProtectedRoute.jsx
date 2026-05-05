import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { checkVerificationStatus } from '../utils/emailVerification'
import LoadingSpinner from '../components/LoadingSpinner'
import EmailVerificationModal from '../components/EmailVerificationModal'

/**
 * Protected route that checks email verification
 * Redirects to login if not authenticated
 * Shows verification modal if email not verified
 */
export default function ProtectedRoute({ children, requireEmailVerification = true }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [isVerified, setIsVerified] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [showVerificationModal, setShowVerificationModal] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user)
                setIsAuthenticated(true)

                if (requireEmailVerification) {
                    const verified = await checkVerificationStatus()
                    setIsVerified(verified)

                    if (!verified) {
                        setShowVerificationModal(true)
                    }
                } else {
                    setIsVerified(true)
                }
            } else {
                setIsAuthenticated(false)
            }
        })

        return () => unsubscribe()
    }, [requireEmailVerification])

    if (isAuthenticated === null) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth-select" replace />
    }

    if (requireEmailVerification && !isVerified) {
        return (
            <>
                {showVerificationModal && currentUser && (
                    <EmailVerificationModal
                        user={currentUser}
                        onVerified={() => {
                            setIsVerified(true)
                            setShowVerificationModal(false)
                        }}
                        autoClose={false}
                    />
                )}
                {children}
            </>
        )
    }

    return children
}
