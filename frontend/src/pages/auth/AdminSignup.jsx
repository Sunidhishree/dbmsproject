import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'
import { sendVerificationEmail } from '../../utils/emailVerification'
import BloodCellBackground from '../../components/BloodCellBackground'
import EmailVerificationModal from '../../components/EmailVerificationModal'

export default function AdminSignup() {
    const navigate = useNavigate()
    const [step, setStep] = useState('code') // 'code' or 'signup'
    const [adminCode, setAdminCode] = useState('')
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [codeError, setCodeError] = useState('')

    const handleCodeSubmit = async (e) => {
        e.preventDefault()
        setCodeError('')
        setLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate-admin-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: adminCode })
            })

            const data = await response.json()

            if (!response.ok) {
                setCodeError(data.error || 'Invalid admin code')
                setLoading(false)
                return
            }

            // Code is valid, proceed to signup form
            setStep('signup')
            setAdminCode('')
        } catch (err) {
            setCodeError(err.message || 'Error validating code')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            // Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

            // Send verification email
            await sendVerificationEmail(userCredential.user)
            setCurrentUser(userCredential.user)

            // Register user in MongoDB via Flask
            const idToken = await userCredential.user.getIdToken()
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: formData.email,
                    name: formData.name,
                    role: 'admin',
                    emailVerified: false
                })
            })

            if (!response.ok) throw new Error('Failed to register admin')

            // Store token, role, and name in localStorage
            localStorage.setItem('firebaseToken', idToken)
            localStorage.setItem('authToken', idToken)
            localStorage.setItem('userRole', 'admin')
            localStorage.setItem('userName', formData.name)

            // Show verification modal
            setShowVerificationModal(true)
        } catch (err) {
            setShowVerificationModal(false)
            setCurrentUser(null)
            setError(err?.message || 'Failed to create admin account or send verification email')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setError('')
        setLoading(true)

        try {
            const result = await signInWithPopup(auth, googleProvider)
            const idToken = await result.user.getIdToken()

            const registerResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({
                    uid: result.user.uid,
                    email: result.user.email,
                    name: result.user.displayName || result.user.email.split('@')[0],
                    role: 'admin',
                    emailVerified: true // Google accounts are auto-verified
                })
            })

            if (!registerResponse.ok) throw new Error('Failed to register')

            localStorage.setItem('firebaseToken', idToken)
            localStorage.setItem('authToken', idToken)
            localStorage.setItem('userRole', 'admin')
            localStorage.setItem('userName', result.user.displayName || result.user.email.split('@')[0])

            navigate('/dashboard/admin')
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
                        {step === 'code' ? (
                            <>
                                <h1 className="text-center font-heading text-5xl text-dark mb-3">Admin Registration</h1>
                                <p className="text-gray text-center mb-8">Enter your admin code to proceed</p>

                                {codeError && (
                                    <div className="bg-red-pale border border-red-200 text-red-dark px-4 py-3 rounded-lg mb-6 text-sm">
                                        {codeError}
                                    </div>
                                )}

                                <form onSubmit={handleCodeSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-dark font-semibold mb-2">Admin Code</label>
                                        <input
                                            type="text"
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                                            required
                                            placeholder="e.g., HP098"
                                            maxLength="5"
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 text-center text-lg tracking-widest"
                                        />
                                        <p className="text-xs text-gray mt-2">Contact your administrator if you don't have a code</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !adminCode}
                                        className="brand-button w-full disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Verify Code'}
                                    </button>
                                </form>

                                <p className="text-center text-gray-600 mt-6">
                                    Already an admin?{' '}
                                    <button
                                        onClick={() => navigate('/login/admin')}
                                        className="text-red-dark font-semibold hover:underline"
                                    >
                                        Login here
                                    </button>
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-center font-heading text-5xl text-dark mb-3">Create Admin Account</h1>
                                <p className="text-gray text-center mb-8">Set up your admin credentials</p>

                                {error && (
                                    <div className="bg-red-pale border border-red-200 text-red-dark px-4 py-3 rounded-lg mb-6 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-dark font-semibold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

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

                                    <div>
                                        <label className="block text-dark font-semibold mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Confirm password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="brand-button w-full disabled:opacity-50"
                                    >
                                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                                    </button>
                                </form>

                                <div className="my-6 flex items-center">
                                    <div className="flex-1 border-t border-gray-300"></div>
                                    <span className="px-3 text-gray text-sm">OR</span>
                                    <div className="flex-1 border-t border-gray-300"></div>
                                </div>

                                <button
                                    onClick={handleGoogleSignUp}
                                    disabled={loading}
                                    className="brand-button--light w-full disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign up with Google
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('code')
                                        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                                        setError('')
                                    }}
                                    className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    ← Back
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
