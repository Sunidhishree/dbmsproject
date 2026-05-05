import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'
import { checkVerificationStatus } from '../../utils/emailVerification'
import BloodCellBackground from '../../components/BloodCellBackground'
import EmailVerificationModal from '../../components/EmailVerificationModal'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const saveAdminSession = async (idToken, uid, email, name, emailVerified = false) => {
        const registerResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ uid, email, name, role: 'admin', emailVerified })
        })

        if (!registerResponse.ok) {
            throw new Error('Failed to save admin profile')
        }

        localStorage.setItem('firebaseToken', idToken)
        localStorage.setItem('authToken', idToken)
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('userName', name)
        navigate('/dashboard/admin')
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)

        try {
            const result = await signInWithPopup(auth, googleProvider)
            const idToken = await result.user.getIdToken()
            await saveAdminSession(
                idToken,
                result.user.uid,
                result.user.email,
                result.user.displayName || result.user.email.split('@')[0]
            )
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)

            // Check if email is verified
            const isVerified = await checkVerificationStatus()

            if (!isVerified) {
                setCurrentUser(userCredential.user)
                setShowVerificationModal(true)
                setLoading(false)
                return
            }

            const idToken = await userCredential.user.getIdToken()
            await saveAdminSession(
                idToken,
                userCredential.user.uid,
                formData.email,
                userCredential.user.displayName || formData.email.split('@')[0],
                true
            )
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-shell page-shell--plain">
            <BloodCellBackground />

            {showVerificationModal && currentUser && (
                <EmailVerificationModal
                    user={currentUser}
                    onVerified={() => {
                        setShowVerificationModal(false)
                        navigate('/dashboard/admin')
                    }}
                />
            )}

            <div className="content-shell relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="surface-card p-8">
                        <h1 className="text-center font-heading text-5xl text-dark mb-3">Admin Login</h1>
                        <p className="text-gray text-center mb-8">Access administrative dashboard</p>

                        {error && (
                            <div className="bg-red-pale border border-red-200 text-red-dark px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-dark font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-dark font-semibold mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                    placeholder="Enter password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="brand-button w-full disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Admin Login'}
                            </button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-3 text-gray text-sm">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="brand-button--light w-full disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <p className="text-center text-gray-600 mt-6">
                            New admin?{' '}
                            <button
                                onClick={() => navigate('/signup/admin')}
                                className="text-red-dark font-semibold hover:underline"
                            >
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
