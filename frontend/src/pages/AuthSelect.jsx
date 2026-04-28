import React from 'react'
import { useNavigate } from 'react-router-dom'
import BloodCellBackground from '../components/BloodCellBackground'
import SiteFooter from '../components/SiteFooter'

export default function AuthSelect() {
    const navigate = useNavigate()

    return (
        <div className="page-shell">
            <BloodCellBackground />

            <div className="content-shell">
                <div className="page-section py-16 lg:py-24">
                    <div className="max-w-3xl mx-auto text-center mb-14">
                        <div className="hero-kicker mx-auto mb-6">Select your access path</div>
                        <h2 className="section-heading">Choose Your Role</h2>
                        <p className="section-subtitle mt-5 max-w-2xl mx-auto">
                            Choose the path that matches what you need to do right now.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                        <div className="auth-card p-8">
                            <div className="auth-card__icon mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5M18.5 1.5v6h-6" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="font-heading text-3xl text-dark mb-3">Administrator</h3>
                                <p className="text-gray max-w-sm mb-6">
                                    Manage blood requests, monitor donor data, and keep the system moving.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => navigate('/login/admin')} className="brand-button--ghost w-full">
                                    Login
                                </button>
                                <button onClick={() => navigate('/signup/admin')} className="brand-button w-full">
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        <div className="auth-card p-8">
                            <div className="auth-card__icon mb-6">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 10a3 3 0 100-6 3 3 0 000 6zM3.172 5.172a4 4 0 015.656 0M17 11a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="font-heading text-3xl text-dark mb-3">User</h3>
                                <p className="text-gray max-w-sm mb-6">
                                    Register as a donor or request blood with a quick, guided flow.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => navigate('/login/user')} className="brand-button--ghost w-full">
                                    Login
                                </button>
                                <button onClick={() => navigate('/signup/user')} className="brand-button w-full">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SiteFooter />
        </div>
    )
}
