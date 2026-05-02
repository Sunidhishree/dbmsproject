import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BloodCellBackground from '../../components/BloodCellBackground'

export default function UserDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [donorProfile, setDonorProfile] = useState(null)
    const [isRegisteredDonor, setIsRegisteredDonor] = useState(false)
    const [userRequests, setUserRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formError, setFormError] = useState('')

    const [requestForm, setRequestForm] = useState({
        patientName: '',
        contactNumber: '',
        bloodType: '',
        unitsRequired: '',
        hospitalName: '',
        hospitalLocation: '',
        urgency: 'Planned Surgery',
        notes: ''
    })

    useEffect(() => {
        // Check auth
        const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
        if (!token) {
            navigate('/login/user')
            return
        }

        fetchDonorProfile()
        fetchUserRequests()

        // Poll for request status updates every 30 seconds
        const interval = setInterval(fetchUserRequests, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchDonorProfile = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/donors/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const donor = await response.json()
                setDonorProfile(donor)
                setIsRegisteredDonor(true)
            } else {
                setIsRegisteredDonor(false)
            }
        } catch (err) {
            setError('Failed to fetch donor profile')
            setIsRegisteredDonor(false)
        }
    }

    const fetchUserRequests = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setUserRequests(data.requests || [])
            }
        } catch (err) {
            console.error('Failed to fetch requests:', err)
        }
    }

    const handleRequestFormChange = (e) => {
        const { name, value } = e.target
        setRequestForm({ ...requestForm, [name]: value })
    }

    const handleSubmitRequest = async (e) => {
        e.preventDefault()
        setFormError('')
        setLoading(true)

        if (!requestForm.patientName || !requestForm.contactNumber || !requestForm.bloodType ||
            !requestForm.unitsRequired || !requestForm.hospitalName || !requestForm.hospitalLocation) {
            setFormError('Please fill all required fields')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientName: requestForm.patientName,
                    contactNumber: requestForm.contactNumber,
                    bloodType: requestForm.bloodType,
                    unitsRequired: parseInt(requestForm.unitsRequired),
                    hospitalName: requestForm.hospitalName,
                    hospitalLocation: requestForm.hospitalLocation,
                    urgency: requestForm.urgency,
                    notes: requestForm.notes
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create request')
            }

            // Reset form
            setRequestForm({
                patientName: '',
                contactNumber: '',
                bloodType: '',
                unitsRequired: '',
                hospitalName: '',
                hospitalLocation: '',
                urgency: 'Planned Surgery',
                notes: ''
            })

            // Refresh requests
            await fetchUserRequests()
            setFormError('Request created successfully!')
            setTimeout(() => setFormError(''), 3000)
        } catch (err) {
            setFormError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getUrgencyBadgeColor = (urgency) => {
        switch (urgency) {
            case 'Emergency':
                return 'bg-red-100 text-red-800'
            case 'Planned Surgery':
                return 'bg-orange-100 text-orange-800'
            case 'Chronic Condition':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-blue-100 text-blue-800'
        }
    }

    return (
        <div className="page-shell page-shell--plain">
            <BloodCellBackground />

            <div className="content-shell relative z-10 min-h-[calc(100vh-64px)] px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-heading text-6xl text-dark mb-2">User Dashboard</h1>
                        <p className="text-gray text-lg">Manage your donor profile and blood requests</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="surface-card surface-card--solid rounded-b-none flex overflow-hidden">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-4 px-6 font-semibold text-lg transition-colors duration-300 ${activeTab === 'profile'
                                ? 'text-red-dark border-b-4 border-red-light bg-red-pale/60'
                                : 'text-gray hover:text-red-dark'
                                }`}
                        >
                            My Donor Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`flex-1 py-4 px-6 font-semibold text-lg transition-colors duration-300 ${activeTab === 'request'
                                ? 'text-red border-b-4 border-red'
                                : 'text-gray-600 hover:text-red'
                                }`}
                        >
                            Request Blood
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="surface-card rounded-t-none p-8">
                        {/* TAB 1: DONOR PROFILE */}
                        {activeTab === 'profile' && (
                            <div>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                        {error}
                                    </div>
                                )}

                                {isRegisteredDonor && donorProfile ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="font-heading text-4xl text-dark">Your Donor Profile</h2>
                                            <button
                                                onClick={() => navigate('/register/donor')}
                                                className="brand-button"
                                            >
                                                Update Profile
                                            </button>
                                        </div>

                                        {/* Blood Type Badge */}
                                        <div className="text-center mb-8">
                                            <p className="text-gray text-sm mb-2 uppercase tracking-[0.1em]">YOUR BLOOD TYPE</p>
                                            <div className="inline-block blood-badge px-8 py-4">
                                                <p className="text-5xl font-heading">{donorProfile.bloodType}</p>
                                            </div>
                                        </div>

                                        {/* Personal Info */}
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <p className="text-sm text-gray mb-1">Full Name</p>
                                                <p className="text-lg font-semibold text-dark">{donorProfile.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray mb-1">Email</p>
                                                <p className="text-lg font-semibold text-dark">{donorProfile.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray mb-1">Phone</p>
                                                <p className="text-lg font-semibold text-dark">{donorProfile.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray mb-1">Age</p>
                                                <p className="text-lg font-semibold text-dark">{donorProfile.age} years</p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="border-t pt-6">
                                            <h3 className="font-heading text-3xl text-dark mb-4">Location</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Address</p>
                                                    <p className="text-gray-800">{donorProfile.address1}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Locality</p>
                                                    <p className="text-gray-800">{donorProfile.locality}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">City</p>
                                                    <p className="text-gray-800">{donorProfile.city}, {donorProfile.state} {donorProfile.pinCode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical Info */}
                                        <div className="border-t pt-6">
                                            <h3 className="font-heading text-3xl text-dark mb-4">Medical Information</h3>
                                            <div className="grid grid-cols-2 gap-6 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                                                    <p className="text-gray-800">{donorProfile.weight} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Hemoglobin Level</p>
                                                    <p className="text-gray-800">{donorProfile.hemoglobin} g/dL</p>
                                                </div>
                                            </div>

                                            {/* Medical Flags */}
                                            <div className="flex flex-wrap gap-3 mt-4">
                                                {donorProfile.smoker && (
                                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        Smoker
                                                    </span>
                                                )}
                                                {donorProfile.alcoholUse && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        Alcohol Use
                                                    </span>
                                                )}
                                                {donorProfile.recentTattoos && (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        Recent Tattoos
                                                    </span>
                                                )}
                                                {donorProfile.existingDisease && (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        Medical Condition
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Last Donation */}
                                        <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray mb-1">Last Donation Date</p>
                                            <p className="text-lg font-semibold text-dark">
                                                {new Date(donorProfile.lastDonationDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="max-w-md mx-auto surface-card p-8">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-red-dark" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                            </svg>
                                            <h3 className="font-heading text-4xl text-dark mb-2">Not Yet a Donor?</h3>
                                            <p className="text-gray mb-6">Register as a blood donor to save lives! Fill out a quick questionnaire to get started.</p>
                                            <button
                                                onClick={() => navigate('/register/donor')}
                                                className="brand-button w-full"
                                            >
                                                Register as Donor
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: REQUEST BLOOD */}
                        {activeTab === 'request' && (
                            <div>
                                {/* Blood Request Form */}
                                <div className="mb-12">
                                    <h2 className="font-heading text-4xl text-dark mb-6">Request Blood</h2>

                                    {formError && (
                                        <div className={`px-4 py-3 rounded-lg mb-6 ${formError.includes('successfully')
                                            ? 'bg-green-50 border border-green-200 text-green-700'
                                            : 'bg-red-pale border border-red-200 text-red-dark'
                                            }`}>
                                            {formError}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitRequest} className="space-y-6 surface-card p-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Patient Name *</label>
                                                <input
                                                    type="text"
                                                    name="patientName"
                                                    value={requestForm.patientName}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    placeholder="Enter patient name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Contact Number *</label>
                                                <input
                                                    type="tel"
                                                    name="contactNumber"
                                                    value={requestForm.contactNumber}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    placeholder="Enter contact number"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Blood Type Needed *</label>
                                                <select
                                                    name="bloodType"
                                                    value={requestForm.bloodType}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
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

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Units Required *</label>
                                                <input
                                                    type="number"
                                                    name="unitsRequired"
                                                    value={requestForm.unitsRequired}
                                                    onChange={handleRequestFormChange}
                                                    min="1"
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    placeholder="Number of units"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Hospital Name *</label>
                                                <input
                                                    type="text"
                                                    name="hospitalName"
                                                    value={requestForm.hospitalName}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    placeholder="Enter hospital name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Hospital Location / Area *</label>
                                                <input
                                                    type="text"
                                                    name="hospitalLocation"
                                                    value={requestForm.hospitalLocation}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    placeholder="Enter location/area"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Urgency Level</label>
                                                <select
                                                    name="urgency"
                                                    value={requestForm.urgency}
                                                    onChange={handleRequestFormChange}
                                                    className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                >
                                                    <option value="Emergency">Emergency</option>
                                                    <option value="Planned Surgery">Planned Surgery</option>
                                                    <option value="Chronic Condition">Chronic Condition</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Additional Notes</label>
                                            <textarea
                                                name="notes"
                                                value={requestForm.notes}
                                                onChange={handleRequestFormChange}
                                                className="w-full px-4 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                placeholder="Enter any additional information"
                                                rows="4"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full brand-button py-3 rounded-xl font-bold disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </form>
                                </div>

                                {/* My Requests */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
                                        <button
                                            onClick={fetchUserRequests}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    {userRequests.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-600 text-lg">No requests yet. Create one above to get started!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {userRequests.map((req) => (
                                                <div key={req._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-800">{req.patientName}</h3>
                                                            <p className="text-sm text-gray-600">{req.hospitalName}</p>
                                                        </div>
                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(req.status)}`}>
                                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 mb-4">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Blood Type:</span>
                                                            <span className="font-bold text-red text-lg">{req.bloodType}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Units Required:</span>
                                                            <span className="font-semibold">{req.unitsRequired} units</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Urgency:</span>
                                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getUrgencyBadgeColor(req.urgency)}`}>
                                                                {req.urgency}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Date:</span>
                                                            <span className="text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    {req.notes && (
                                                        <div className="bg-red-pale p-3 rounded-xl text-sm text-dark border-l-4 border-red">
                                                            <p className="font-semibold text-gray-800 mb-1">Notes:</p>
                                                            <p>{req.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
