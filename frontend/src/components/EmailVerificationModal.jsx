import React, { useState, useEffect } from 'react'
import { checkVerificationStatus, resendVerificationEmail } from '../utils/emailVerification'

export default function EmailVerificationModal({ user, onVerified, autoClose = true }) {
    const [isVerified, setIsVerified] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pollInterval, setPollInterval] = useState(null)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [resendCountdown, setResendCountdown] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        // Start polling for verification status
        const poll = async () => {
            const verified = await checkVerificationStatus()
            setIsVerified(verified)
            if (verified && onVerified) {
                onVerified()
            }
        }

        poll()
        const interval = setInterval(poll, 3000) // Check every 3 seconds
        setPollInterval(interval)

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [onVerified])

    // Handle resend countdown
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (resendCountdown === 0 && resendDisabled) {
            setResendDisabled(false)
        }
    }, [resendCountdown, resendDisabled])

    const handleResendEmail = async () => {
        setError('')
        setLoading(true)
        setResendDisabled(true)
        setResendCountdown(60)

        try {
            await resendVerificationEmail()
            setError('')
        } catch (err) {
            setError(err.message || 'Failed to resend verification email')
            setResendDisabled(false)
            setResendCountdown(0)
        } finally {
            setLoading(false)
        }
    }

    if (isVerified && autoClose) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Verify Your Email
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                        We've sent a verification link to <span className="font-medium">{user?.email}</span>
                    </p>

                    <p className="text-gray-500 text-sm mb-6">
                        Click the link in the email to verify your account. We're checking for verification...
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {isVerified && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm flex items-center justify-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Email verified successfully! ✅
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleResendEmail}
                            disabled={resendDisabled || loading}
                            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${resendDisabled || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Sending...' : resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend Email'}
                        </button>

                        <p className="text-xs text-gray-500">
                            Didn't receive the email? Check your spam folder or try resending.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
