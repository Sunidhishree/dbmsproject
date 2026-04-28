import React from 'react'
import { useNavigate } from 'react-router-dom'
import BloodCellBackground from '../components/BloodCellBackground'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="page-shell page-shell--plain overflow-hidden">
            <BloodCellBackground />

            <div className="content-shell hero-shell min-h-[calc(100vh-4.5rem)]">
                <div className="hero-grid">
                    <div className="hero-kicker">Page missing</div>
                    <h1 className="hero-title font-heading">404</h1>
                    <p className="hero-tagline font-tagline">This page drifted out of reach.</p>
                    <p className="hero-copy mx-auto">
                        The page you're looking for doesn't exist or moved somewhere else in RitConnect.
                    </p>
                    <div className="hero-actions">
                        <button onClick={() => navigate(-1)} className="brand-button--ghost">
                            Go Back
                        </button>
                        <button onClick={() => navigate('/')} className="brand-button">
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
