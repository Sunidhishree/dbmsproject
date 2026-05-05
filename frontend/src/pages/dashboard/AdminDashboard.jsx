import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts'
import BloodCellBackground from '../../components/BloodCellBackground'
import DiagramsModal from '../../components/DiagramsModal'

const COLORS = ['#C0152A', '#E91E63', '#FF5252', '#FF80AB', '#FF6B9D', '#FF4081', '#D50000', '#B71C1C']
const STATUS_COLORS = { pending: '#FBBF24', approved: '#34D399', rejected: '#F87171', completed: '#60A5FA' }

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('analytics')
    const [userRole, setUserRole] = useState('')
    const [showDiagramsModal, setShowDiagramsModal] = useState(false)

    // Analytics state
    const [bloodTypeData, setBloodTypeData] = useState([])
    const [locationData, setLocationData] = useState([])
    const [requestsOverTime, setRequestsOverTime] = useState([])
    const [statusBreakdown, setStatusBreakdown] = useState([])
    const [analyticsLoading, setAnalyticsLoading] = useState(false)

    // Manage Requests state
    const [allRequests, setAllRequests] = useState([])
    const [filteredRequests, setFilteredRequests] = useState([])
    const [requestsLoading, setRequestsLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [bloodTypeFilter, setBloodTypeFilter] = useState('all')
    const [areaFilter, setAreaFilter] = useState('')

    // Query Database state
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [notificationSent, setNotificationSent] = useState(null)
    const [areas, setAreas] = useState([])
    const [queryResults, setQueryResults] = useState([])
    const [queryLoading, setQueryLoading] = useState(false)
    const [queryFilters, setQueryFilters] = useState({
        bloodType: 'All',
        area: '',
        donorStatus: 'All donors',
        ageRange: 'All',
        consentOnly: false
    })

    // Donors & Messages state
    const [allDonors, setAllDonors] = useState([])
    const [donorsLoading, setDonorsLoading] = useState(false)
    const [selectedDonor, setSelectedDonor] = useState(null)
    const [messageText, setMessageText] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const [messageError, setMessageError] = useState('')
    const [messageSent, setMessageSent] = useState(false)

    useEffect(() => {
        // Verify admin role
        const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
        const role = localStorage.getItem('userRole')

        if (!token || role !== 'admin') {
            navigate('/login/admin')
            return
        }
        setUserRole(role)

        // Load data based on active tab
        if (activeTab === 'analytics') {
            fetchAnalytics()
        } else if (activeTab === 'requests') {
            fetchAllRequests()
        } else if (activeTab === 'query') {
            fetchAreas()
        } else if (activeTab === 'donors') {
            fetchAllDonors()
        }
    }, [activeTab])

    // ===== ANALYTICS TAB =====
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true)
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')

            const [bloodRes, locRes, timeRes, statusRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/bloodtypes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/locations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/requests-over-time`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/status-breakdown`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            if (bloodRes.ok) {
                const data = await bloodRes.json()
                setBloodTypeData(data.data || [])
            }
            if (locRes.ok) {
                const data = await locRes.json()
                setLocationData(data.data || [])
            }
            if (timeRes.ok) {
                const data = await timeRes.json()
                setRequestsOverTime(data.data || [])
            }
            if (statusRes.ok) {
                const data = await statusRes.json()
                setStatusBreakdown(data.data || [])
            }
        } catch (err) {
            console.error('Error fetching analytics:', err)
        } finally {
            setAnalyticsLoading(false)
        }
    }

    // ===== MANAGE REQUESTS TAB =====
    const fetchAllRequests = async () => {
        setRequestsLoading(true)
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setAllRequests(data.requests || [])
                setFilteredRequests(data.requests || [])
            }
        } catch (err) {
            console.error('Error fetching requests:', err)
        } finally {
            setRequestsLoading(false)
        }
    }

    const handleApproveRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'approved' })
            })

            if (response.ok) {
                await fetchAllRequests()
            }
        } catch (err) {
            console.error('Error approving request:', err)
        }
    }

    const handleRejectRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'rejected' })
            })

            if (response.ok) {
                await fetchAllRequests()
            }
        } catch (err) {
            console.error('Error rejecting request:', err)
        }
    }

    const applyRequestFilters = () => {
        let filtered = allRequests

        if (statusFilter !== 'all') {
            filtered = filtered.filter(req => req.status === statusFilter)
        }

        if (bloodTypeFilter !== 'all') {
            filtered = filtered.filter(req => req.bloodType === bloodTypeFilter)
        }

        if (areaFilter) {
            filtered = filtered.filter(req =>
                req.hospitalLocation.toLowerCase().includes(areaFilter.toLowerCase())
            )
        }

        setFilteredRequests(filtered)
    }

    useEffect(() => {
        applyRequestFilters()
    }, [statusFilter, bloodTypeFilter, areaFilter, allRequests])

    // ===== QUERY DATABASE TAB =====
    const fetchAreas = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/areas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setAreas(data.areas || [])
            }
        } catch (err) {
            console.error('Error fetching areas:', err)
        }
    }

    const handleQueryFilterChange = (e) => {
        const { name, value, type, checked } = e.target
        setQueryFilters({
            ...queryFilters,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleRunQuery = async () => {
        setQueryLoading(true)
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const params = new URLSearchParams()

            if (queryFilters.bloodType !== 'All') params.append('bloodType', queryFilters.bloodType)
            if (queryFilters.area) params.append('area', queryFilters.area)
            if (queryFilters.donorStatus !== 'All donors') params.append('donorStatus', queryFilters.donorStatus)
            if (queryFilters.ageRange !== 'All') params.append('ageRange', queryFilters.ageRange)
            if (queryFilters.consentOnly) params.append('consentOnly', 'true')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/query?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setQueryResults(data.donors || [])
            }
        } catch (err) {
            console.error('Error running query:', err)
        } finally {
            setQueryLoading(false)
        }
    }

    const handleFindDonorsForRequest = async (req) => {
        setSelectedRequest(req);
        setNotificationSent(null);
        const newFilters = {
            bloodType: req.bloodType || 'All',
            area: '',
            donorStatus: 'All donors',
            ageRange: 'All',
            consentOnly: false
        };
        setQueryFilters(newFilters);
        setActiveTab('query');

        setQueryLoading(true);
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const params = new URLSearchParams()
            if (newFilters.bloodType !== 'All') params.append('bloodType', newFilters.bloodType)

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/query?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setQueryResults(data.donors || [])
            }
        } catch (err) {
            console.error('Error finding donors:', err)
        } finally {
            setQueryLoading(false)
        }
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getUrgencyBadgeColor = (urgency) => {
        switch (urgency) {
            case 'Emergency': return 'bg-red-100 text-red-800'
            case 'Planned Surgery': return 'bg-orange-100 text-orange-800'
            case 'Chronic Condition': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-blue-100 text-blue-800'
        }
    }

    // ===== DONORS & MESSAGES TAB =====
    const fetchAllDonors = async () => {
        setDonorsLoading(true)
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/donor/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setAllDonors(data.donors || [])
            }
        } catch (err) {
            console.error('Error fetching donors:', err)
        } finally {
            setDonorsLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!selectedDonor || !messageText.trim()) {
            setMessageError('Please select a donor and enter a message')
            return
        }

        setSendingMessage(true)
        setMessageError('')
        setMessageSent(false)

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/message/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipient_uid: selectedDonor.uid,
                    message: messageText,
                    request_id: selectedRequest?._id
                })
            })

            if (response.ok) {
                setMessageSent(true)
                setMessageText('')
                setTimeout(() => setMessageSent(false), 3000)
            } else {
                const errorData = await response.json()
                setMessageError(errorData.error || 'Failed to send message')
            }
        } catch (err) {
            setMessageError(err.message)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleAssignDonor = async () => {
        if (!selectedRequest || !selectedDonor) {
            setMessageError('Select both a request and a donor before assigning')
            return
        }

        setSendingMessage(true)
        setMessageError('')
        setMessageSent(false)

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${selectedRequest._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'approved',
                    assignedDonorUid: selectedDonor.uid
                })
            })

            if (response.ok) {
                setMessageSent(true)
                setTimeout(() => setMessageSent(false), 3000)
                await fetchAllRequests()
            } else {
                const errorData = await response.json()
                setMessageError(errorData.error || 'Failed to assign donor')
            }
        } catch (err) {
            setMessageError(err.message)
        } finally {
            setSendingMessage(false)
        }
    }

    return (
        <div className="page-shell page-shell--plain">
            <BloodCellBackground />

            <div className="content-shell relative z-10 min-h-[calc(100vh-64px)] px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header with View Diagrams Button */}
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="font-heading text-6xl text-dark mb-2">Admin Dashboard</h1>
                            <p className="text-gray text-lg">Manage blood requests and analyze donor data</p>
                        </div>
                        <button
                            onClick={() => setShowDiagramsModal(true)}
                            className="px-6 py-3 bg-red text-white font-semibold rounded-xl hover:bg-red-dark transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            📊
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="surface-card surface-card--solid rounded-b-none flex overflow-hidden">
                        {['analytics', 'requests', 'query', 'donors'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 font-semibold text-lg transition-colors duration-300 ${activeTab === tab
                                    ? 'text-red-dark border-b-4 border-red-light bg-red-pale/60'
                                    : 'text-gray hover:text-red-dark'
                                    }`}
                            >
                                {tab === 'analytics' && 'Analytics'}
                                {tab === 'requests' && 'Manage Requests'}
                                {tab === 'query' && 'Query Database'}
                                {tab === 'donors' && 'Donors & Messages'}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="surface-card rounded-t-none p-8">
                        {/* TAB 1: ANALYTICS */}
                        {activeTab === 'analytics' && (
                            <div>
                                {analyticsLoading ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">Loading analytics...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <h2 className="font-heading text-4xl text-dark">Dashboard Analytics</h2>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Blood Type Distribution */}
                                            <div className="surface-card p-6">
                                                <h3 className="font-heading text-3xl text-dark mb-4">Blood Type Distribution</h3>
                                                {bloodTypeData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={bloodTypeData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={(entry) => entry.bloodType}
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="count"
                                                            >
                                                                {bloodTypeData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <p className="text-gray-600 text-center py-8">No data available</p>
                                                )}
                                            </div>

                                            {/* Request Status Breakdown */}
                                            <div className="surface-card p-6">
                                                <h3 className="font-heading text-3xl text-dark mb-4">Request Status Breakdown</h3>
                                                {statusBreakdown.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={statusBreakdown}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={(entry) => `${entry.status}: ${entry.count}`}
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="count"
                                                            >
                                                                {statusBreakdown.map((entry) => (
                                                                    <Cell
                                                                        key={`cell-${entry.status}`}
                                                                        fill={STATUS_COLORS[entry.status] || '#999'}
                                                                    />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <p className="text-gray-600 text-center py-8">No data available</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Donor Location Heatmap */}
                                        <div className="surface-card p-6">
                                            <h3 className="font-heading text-3xl text-dark mb-4">Donor Location Distribution</h3>
                                            <p className="text-sm text-gray mb-4 italic">
                                                * For advanced geographic heatmap, integrate Google Maps API with heatmap layer (coordinates needed)
                                            </p>
                                            {locationData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart
                                                        data={locationData}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" />
                                                        <YAxis dataKey="area" type="category" width={190} />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#C0152A" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-gray-600 text-center py-8">No data available</p>
                                            )}
                                        </div>

                                        {/* Requests Over Time */}
                                        <div className="surface-card p-6">
                                            <h3 className="font-heading text-3xl text-dark mb-4">Requests Over Time (Last 30 Days)</h3>
                                            {requestsOverTime.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={requestsOverTime}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="date" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#C0152A"
                                                            strokeWidth={2}
                                                            dot={{ fill: '#C0152A', r: 4 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-gray-600 text-center py-8">No data available</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: MANAGE REQUESTS */}
                        {activeTab === 'requests' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Blood Requests</h2>

                                {/* Filters */}
                                <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                                            <select
                                                value={bloodTypeFilter}
                                                onChange={(e) => setBloodTypeFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="all">All Types</option>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                                            <input
                                                type="text"
                                                value={areaFilter}
                                                onChange={(e) => setAreaFilter(e.target.value)}
                                                placeholder="Search area..."
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                onClick={fetchAllRequests}
                                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Requests Table */}
                                {requestsLoading ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">Loading requests...</p>
                                    </div>
                                ) : filteredRequests.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600">No requests found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Patient Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Blood Type</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Hospital</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Area</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Urgency</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRequests.map((req) => (
                                                    <tr key={req._id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-800">{req.patientName}</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-red">{req.bloodType}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-800">{req.hospitalName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-800">{req.hospitalLocation}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getUrgencyBadgeColor(req.urgency)}`}>
                                                                {req.urgency}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(req.status)}`}>
                                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex flex-col gap-2">
                                                                {req.status === 'pending' && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleApproveRequest(req._id)}
                                                                            className="px-3 py-1 bg-green-500 text-white text-xs rounded font-semibold hover:bg-green-600 transition-colors"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectRequest(req._id)}
                                                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded font-semibold hover:bg-red-600 transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {(req.status === 'pending' || req.status === 'approved') && (
                                                                    <button
                                                                        onClick={() => handleFindDonorsForRequest(req)}
                                                                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded font-semibold hover:bg-blue-600 transition-colors w-fit"
                                                                    >
                                                                        Find Donors
                                                                    </button>
                                                                )}
                                                                {req.status !== 'pending' && req.status !== 'approved' && (
                                                                    <span className="text-gray-500 text-xs">No actions</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: QUERY DATABASE */}
                        {activeTab === 'query' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Explorer</h2>

                                {selectedRequest && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-blue-800 font-bold">Mapping Donors for Patient: {selectedRequest.patientName}</h4>
                                                <p className="text-blue-600 text-sm">
                                                    Needs {selectedRequest.bloodType} blood at {selectedRequest.hospitalName}, {selectedRequest.hospitalLocation}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedRequest(null)}
                                                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                                            >
                                                Clear Mapping
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Query Filters */}
                                <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Apply Filters</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                                            <select
                                                name="bloodType"
                                                value={queryFilters.bloodType}
                                                onChange={handleQueryFilterChange}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="All">All Blood Types</option>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Area/City</label>
                                            <select
                                                name="area"
                                                value={queryFilters.area}
                                                onChange={handleQueryFilterChange}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="">All Areas</option>
                                                {areas.map((area) => (
                                                    <option key={area} value={area}>
                                                        {area}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Donor Status</label>
                                            <select
                                                name="donorStatus"
                                                value={queryFilters.donorStatus}
                                                onChange={handleQueryFilterChange}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="All donors">All Donors</option>
                                                <option value="Smokers">Smokers</option>
                                                <option value="Non-smokers">Non-smokers</option>
                                                <option value="Recent tattoos">Recent Tattoos</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                                            <select
                                                name="ageRange"
                                                value={queryFilters.ageRange}
                                                onChange={handleQueryFilterChange}
                                                className="w-full px-3 py-2 border border-white/80 rounded-xl bg-white/90 focus:outline-none focus:border-red"
                                            >
                                                <option value="All">All Ages</option>
                                                <option value="18-25">18-25</option>
                                                <option value="26-35">26-35</option>
                                                <option value="36-50">36-50</option>
                                                <option value="50+">50+</option>
                                            </select>
                                        </div>

                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="consentOnly"
                                                    checked={queryFilters.consentOnly}
                                                    onChange={handleQueryFilterChange}
                                                    className="w-4 h-4 text-red rounded cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700">Consent to Contact Only</span>
                                            </label>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                onClick={handleRunQuery}
                                                disabled={queryLoading}
                                                className="w-full brand-button px-4 py-2 rounded-xl disabled:opacity-50"
                                            >
                                                {queryLoading ? 'Running...' : 'Run Query'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Query Results */}
                                {queryResults.length === 0 && queryFilters.bloodType !== 'All' ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600">No donors found. Try adjusting filters.</p>
                                    </div>
                                ) : queryResults.length > 0 ? (
                                    <div>
                                        <p className="text-gray-600 mb-4">Found {queryResults.length} donor(s)</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Blood Type</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Age</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Area</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Hemoglobin</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Contact</th>
                                                        {selectedRequest && (
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Action</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queryResults.map((donor) => (
                                                        <tr key={donor._id} className="border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-gray-800">{donor.fullName}</td>
                                                            <td className="px-4 py-3 text-sm font-bold text-red">{donor.bloodType}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{donor.age}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{donor.locality}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{donor.hemoglobin} g/dL</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                                {donor.consentCheckbox ? donor.email || donor.phone : 'Not shared'}
                                                            </td>
                                                            {selectedRequest && (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {notificationSent === donor._id ? (
                                                                        <span className="text-green-600 font-semibold text-xs">✓ Sent to Requester</span>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setNotificationSent(donor._id);
                                                                                setTimeout(() => alert(`Success! An email containing ${donor.fullName}'s contact info has been sent to ${selectedRequest.email}.`), 300);
                                                                            }}
                                                                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded font-semibold hover:bg-blue-600 transition-colors"
                                                                        >
                                                                            Send to Requester
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* TAB 4: DONORS & MESSAGES */}
                        {activeTab === 'donors' && (
                            <div>
                                <h2 className="font-heading text-4xl text-dark mb-6">Registered Donors & Contact</h2>

                                <div className="grid grid-cols-3 gap-8">
                                    {/* Donors List */}
                                    <div className="col-span-2">
                                        <div className="surface-card p-6 rounded-lg">
                                            <h3 className="text-2xl font-semibold text-dark mb-4">All Donors ({allDonors.length})</h3>

                                            {donorsLoading ? (
                                                <p className="text-gray-600">Loading donors...</p>
                                            ) : allDonors.length === 0 ? (
                                                <p className="text-gray-600">No donors registered yet</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                                <th className="px-4 py-3 text-left text-sm font-semibold">Blood Type</th>
                                                                <th className="px-4 py-3 text-left text-sm font-semibold">Area</th>
                                                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                                                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {allDonors.map((donor) => (
                                                                <tr key={donor._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDonor(donor)}>
                                                                    <td className="px-4 py-3 text-sm">{donor.fullName}</td>
                                                                    <td className="px-4 py-3 text-sm font-bold text-red">{donor.bloodType}</td>
                                                                    <td className="px-4 py-3 text-sm">{donor.locality}</td>
                                                                    <td className="px-4 py-3 text-sm">{donor.phone}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                setSelectedDonor(donor)
                                                                            }}
                                                                            className={`px-3 py-1 text-xs rounded font-semibold transition ${selectedDonor?._id === donor._id
                                                                                ? 'bg-red-600 text-white'
                                                                                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                                                                }`}
                                                                        >
                                                                            Select
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Panel */}
                                    <div className="col-span-1">
                                        <div className="surface-card p-6 rounded-lg sticky top-4">
                                            <h3 className="text-2xl font-semibold text-dark mb-4">Send Message</h3>

                                            {messageError && (
                                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                                    {messageError}
                                                </div>
                                            )}

                                            {messageSent && (
                                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                                                    ✓ Action completed successfully!
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2 font-semibold">Selected Donor:</p>
                                                {selectedDonor ? (
                                                    <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                                                        <p className="font-semibold text-dark">{selectedDonor.fullName}</p>
                                                        <p className="text-sm text-gray-600">{selectedDonor.bloodType} • {selectedDonor.locality}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-600 text-sm">Click a donor from the list</p>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-dark mb-2">Message</label>
                                                <textarea
                                                    value={messageText}
                                                    onChange={(e) => setMessageText(e.target.value)}
                                                    placeholder="Type your message here..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                                                    rows="5"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSendMessage}
                                                disabled={sendingMessage || !selectedDonor || !messageText.trim()}
                                                className="w-full brand-button py-2 rounded-lg font-bold disabled:opacity-50"
                                            >
                                                {sendingMessage ? 'Sending...' : 'Send Message'}
                                            </button>

                                            {selectedRequest && selectedDonor && (
                                                <button
                                                    onClick={handleAssignDonor}
                                                    disabled={sendingMessage}
                                                    className="w-full mt-3 px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                                                >
                                                    {sendingMessage ? 'Assigning...' : 'Assign Donor & Notify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Diagrams Modal */}
            <DiagramsModal isOpen={showDiagramsModal} onClose={() => setShowDiagramsModal(false)} />
        </div>
    )
}
