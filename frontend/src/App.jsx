import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthSelect from './pages/AuthSelect'
import UserLogin from './pages/auth/UserLogin'
import UserSignup from './pages/auth/UserSignup'
import AdminLogin from './pages/auth/AdminLogin'
import DonorRegister from './pages/DonorRegister'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import './index.css'

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth-select" element={<AuthSelect />} />

                {/* Auth Routes */}
                <Route path="/login/user" element={<UserLogin />} />
                <Route path="/signup/user" element={<UserSignup />} />
                <Route path="/login/admin" element={<AdminLogin />} />

                {/* Donor Routes */}
                <Route path="/register/donor" element={<DonorRegister />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard/user" element={<UserDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}
