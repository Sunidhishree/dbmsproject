import React from 'react'
import { useNavigate } from 'react-router-dom'
import BloodCellBackground from '../components/BloodCellBackground'
import SiteFooter from '../components/SiteFooter'

export default function Landing() {
    const navigate = useNavigate()
    const stats = [
        { value: '24/7', label: 'availability' },
        { value: '1 tap', label: 'find donors' },
        { value: '4 steps', label: 'quick signup' },
        { value: '100%', label: 'focused care' },
    ]

    return (
        <div className="page-shell page-shell--plain">
            <BloodCellBackground />

            <div className="hero-shell">
                <div className="hero-plasma one" />
                <div className="hero-plasma two" />
                <div className="hero-plasma three" />

                <div className="hero-grid">
                    <div className="hero-kicker">Blood donation made simpler</div>

                    <h1 className="hero-title font-heading">RitConnect</h1>

                    <p className="hero-tagline font-tagline">Every Drop Saves a Life</p>

                    <p className="hero-copy font-body">
                        Search donors, register profiles, and manage urgent blood requests with a calm, clear experience.
                    </p>

                    <div className="hero-actions">
                        <button onClick={() => navigate('/auth-select')} className="brand-button">
                            Get Started
                        </button>
                        <button onClick={() => navigate('/auth-select')} className="brand-button--ghost">
                            Choose Role
                        </button>
                    </div>
                </div>
            </div>

            <section className="stats-strip">
                <div className="stats-grid">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stats-item">
                            <span className="stat-number font-heading">{stat.value}</span>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}
