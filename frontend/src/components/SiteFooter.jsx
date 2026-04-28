import React from 'react'

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div>
                    <div className="site-footer__logo font-heading">RitConnect</div>
                    <p className="mt-2 text-sm max-w-md">
                        Built to connect donors, requests, and urgent care in one clear flow.
                    </p>
                </div>

                <p className="text-sm">Every drop matters.</p>
            </div>
        </footer>
    )
}