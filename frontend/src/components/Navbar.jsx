import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Navbar() {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)

                // Get user role from localStorage (set during login)
                const userRole = localStorage.getItem('userRole')
                const userName = localStorage.getItem('userName')

                setRole(userRole)
                if (userName) {
                    setUser((prev) => ({ ...prev, displayName: userName }))
                }
            } else {
                setUser(null)
                setRole(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (!auth.currentUser) return

        const userRole = localStorage.getItem('userRole')
        const userName = localStorage.getItem('userName')

        if (userRole) {
            setRole(userRole)
        }

        if (userName) {
            setUser((prev) => prev ? ({ ...prev, displayName: userName }) : prev)
        }
    }, [location.pathname])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            localStorage.removeItem('firebaseToken')
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userName')
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const publicLinks = [
        { label: 'Home', to: '/' },
        { label: 'Choose Role', to: '/auth-select' },
    ]

    const roleDashboard = role === 'admin' ? '/dashboard/admin' : '/dashboard/user'

    return (
        <nav className="app-navbar">
            <div className="app-navbar__inner">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
                        <span className="app-navbar__logo font-heading">RitConnect</span>
                    </button>
                    <div className="hidden md:flex items-center gap-5 ml-2">
                        {publicLinks.map((link) => (
                            <button
                                key={link.to}
                                onClick={() => navigate(link.to)}
                                className="app-navbar__link"
                            >
                                {link.label}
                            </button>
                        ))}
                        {user && (
                            <button
                                onClick={() => navigate(roleDashboard)}
                                className="app-navbar__link"
                            >
                                Dashboard
                            </button>
                        )}
                    </div>
                </div>

                {!loading && user ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right leading-tight">
                            <p className="text-sm font-semibold text-dark">
                                {user.displayName || user.email?.split('@')[0]}
                            </p>
                            <div className="inline-flex items-center rounded-full bg-red-pale px-3 py-1 text-xs font-semibold text-red-dark">
                                {role === 'admin' ? 'Admin' : 'Donor'}
                            </div>
                        </div>

                        <button onClick={handleLogout} className="app-navbar__cta">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login/user')} className="app-navbar__link hidden sm:inline-flex">
                            Login
                        </button>
                        <button onClick={() => navigate('/auth-select')} className="app-navbar__cta">
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}
