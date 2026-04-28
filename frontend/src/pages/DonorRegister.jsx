import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BloodCellBackground from '../components/BloodCellBackground'

export default function DonorRegister() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isExistingDonor, setIsExistingDonor] = useState(false)
    const [donorProfile, setDonorProfile] = useState(null)

    const [formData, setFormData] = useState({
        // Step 1
        fullName: '',
        phone: '',
        age: '',
        gender: '',
        bloodType: '',
        // Step 2
        address1: '',
        city: '',
        state: '',
        pinCode: '',
        locality: '',
        // Step 3
        weight: '',
        hemoglobin: '',
        existingDisease: '',
        smoker: false,
        alcoholUse: false,
        recentTattoos: false,
        lastDonationDate: '',
        consentCheckbox: false
    })

    useEffect(() => {
        // Check if already registered as donor
        checkExistingDonor()
    }, [])

    const checkExistingDonor = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/donors/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const donor = await response.json()
                setDonorProfile(donor)
                setIsExistingDonor(true)
            }
        } catch (err) {
            // User is not yet a donor, continue with registration
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleNextStep = (e) => {
        e.preventDefault()

        // Validation for Step 1
        if (step === 1) {
            if (!formData.fullName || !formData.phone || !formData.age || !formData.gender || !formData.bloodType) {
                setError('Please fill all fields in this step')
                return
            }
        }

        // Validation for Step 2
        if (step === 2) {
            if (!formData.address1 || !formData.city || !formData.state || !formData.pinCode || !formData.locality) {
                setError('Please fill all fields in this step')
                return
            }
        }

        setError('')
        setStep(step + 1)
    }

    const handlePreviousStep = () => {
        setError('')
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Final validation for Step 3
        if (!formData.weight || !formData.hemoglobin || !formData.lastDonationDate || !formData.consentCheckbox) {
            setError('Please fill all required fields and accept the consent')
            return
        }

        setError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/donors/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to register as donor')
            }

            // Redirect to dashboard
            navigate('/dashboard/user')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Show profile card for existing donors
    if (isExistingDonor && donorProfile) {
        return (
            <div className="page-shell page-shell--plain">
                <BloodCellBackground />

                <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-2xl">
                        <div className="surface-card p-8">
                            <h1 className="text-center font-heading text-5xl text-dark mb-3">Your Donor Profile</h1>
                            <p className="text-gray text-center mb-8">Thank you for being a registered donor!</p>

                            <div className="space-y-6">
                                {/* Personal Info */}
                                <div className="border-b border-white/60 pb-6">
                                    <h2 className="font-heading text-3xl text-dark mb-4 flex items-center">
                                        <span className="bg-red text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-body">1</span>
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray">Full Name</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Blood Type</p>
                                            <p className="blood-badge inline-flex">{donorProfile.bloodType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Phone</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Age</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.age} years</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="border-b border-white/60 pb-6">
                                    <h2 className="font-heading text-3xl text-dark mb-4 flex items-center">
                                        <span className="bg-red text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-body">2</span>
                                        Location Information
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray">Address</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.address1}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">City</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">State</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">PIN Code</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.pinCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Locality</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.locality}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div>
                                    <h2 className="font-heading text-3xl text-dark mb-4 flex items-center">
                                        <span className="bg-red text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-body">3</span>
                                        Medical Information
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray">Weight</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.weight} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Hemoglobin Level</p>
                                            <p className="text-lg font-semibold text-dark">{donorProfile.hemoglobin} g/dL</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray">Last Donation</p>
                                            <p className="text-lg font-semibold text-dark">{new Date(donorProfile.lastDonationDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/dashboard/user')}
                                    className="brand-button w-full"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-shell page-shell--plain">
            <BloodCellBackground />

            <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    <div className="surface-card p-8">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                {[1, 2, 3].map((stepNum) => (
                                    <div key={stepNum} className="flex-1 text-center">
                                        <div
                                            className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white ${stepNum <= step ? 'bg-red' : 'bg-gray-300'
                                                }`}
                                        >
                                            {stepNum}
                                        </div>
                                        <p className={`text-sm ${stepNum <= step ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                                            Step {stepNum}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-red h-full transition-all duration-300"
                                    style={{ width: `${(step / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-pale border border-red-200 text-red-dark px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
                            {/* STEP 1: Personal Info */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h2 className="font-heading text-4xl text-dark mb-6">Personal Information</h2>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter age"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Blood Type</label>
                                        <select
                                            name="bloodType"
                                            value={formData.bloodType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                        >
                                            <option value="">Select blood type</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Location & Address */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h2 className="font-heading text-4xl text-dark mb-6">Location & Address</h2>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Address Line 1</label>
                                        <input
                                            type="text"
                                            name="address1"
                                            value={formData.address1}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Enter address"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter city"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">PIN Code</label>
                                            <input
                                                type="text"
                                                name="pinCode"
                                                value={formData.pinCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter PIN code"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Area/Locality</label>
                                            <input
                                                type="text"
                                                name="locality"
                                                value={formData.locality}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter area/locality"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Medical & Consent */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h2 className="font-heading text-4xl text-dark mb-6">Medical Information & Consent</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter weight"
                                                step="0.1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Hemoglobin Level (g/dL)</label>
                                            <input
                                                type="number"
                                                name="hemoglobin"
                                                value={formData.hemoglobin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter hemoglobin level"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Any Existing Disease</label>
                                        <textarea
                                            name="existingDisease"
                                            value={formData.existingDisease}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                            placeholder="Enter if any (leave blank if none)"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Last Donation Date</label>
                                        <input
                                            type="date"
                                            name="lastDonationDate"
                                            value={formData.lastDonationDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3 bg-white/70 p-5 rounded-2xl border border-white/80">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="smoker"
                                                checked={formData.smoker}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-red rounded cursor-pointer"
                                            />
                                            <span className="ml-3 text-dark font-medium">I am a smoker</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="alcoholUse"
                                                checked={formData.alcoholUse}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-red rounded cursor-pointer"
                                            />
                                            <span className="ml-3 text-dark font-medium">I consume alcohol</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="recentTattoos"
                                                checked={formData.recentTattoos}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-red rounded cursor-pointer"
                                            />
                                            <span className="ml-3 text-dark font-medium">Recent tattoos (last 6 months)</span>
                                        </label>
                                    </div>

                                    {/* Consent Checkbox */}
                                    <label className="flex items-start bg-red-pale p-4 rounded-2xl border border-red-200">
                                        <input
                                            type="checkbox"
                                            name="consentCheckbox"
                                            checked={formData.consentCheckbox}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-red rounded cursor-pointer mt-1 flex-shrink-0"
                                        />
                                        <span className="ml-3 text-dark text-sm">
                                            I agree to be contacted immediately in case of urgent blood need
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 mt-8">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        className="flex-1 border-2 border-red text-red py-3 rounded-xl font-semibold hover:bg-red-pale transition-colors duration-300"
                                    >
                                        Previous
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 brand-button py-3 rounded-xl disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : step === 3 ? 'Complete Registration' : 'Next'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
