import React, { useState } from 'react'

export default function DiagramsModal({ isOpen, onClose }) {
    const [selectedDiagram, setSelectedDiagram] = useState(null)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-red-100 px-8 py-6 flex justify-between items-center">
                    <h2 className="font-heading text-3xl text-dark">Database Diagrams</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red p-2 transition-colors"
                        aria-label="Close diagrams modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {!selectedDiagram ? (
                        <div className="space-y-4">
                            <p className="text-gray text-lg mb-6">Select a diagram to view:</p>

                            {/* ER Diagram Button */}
                            <button
                                onClick={() => setSelectedDiagram('er')}
                                className="w-full p-6 border-2 border-red-200 rounded-xl hover:bg-red-pale transition-all duration-300 text-left group"
                            >
                                <h3 className="font-heading text-2xl text-dark group-hover:text-red transition-colors">
                                    ER Diagram
                                </h3>
                                <p className="text-gray text-sm mt-2">Entity-Relationship Diagram showing database structure</p>
                            </button>

                            {/* Relational Schema Button */}
                            <button
                                onClick={() => setSelectedDiagram('schema')}
                                className="w-full p-6 border-2 border-red-200 rounded-xl hover:bg-red-pale transition-all duration-300 text-left group"
                            >
                                <h3 className="font-heading text-2xl text-dark group-hover:text-red transition-colors">
                                    Relational Schema
                                </h3>
                                <p className="text-gray text-sm mt-2">Detailed relational schema of the database</p>
                            </button>

                            {/* Normalised Form Button */}
                            <button
                                onClick={() => setSelectedDiagram('normal')}
                                className="w-full p-6 border-2 border-red-200 rounded-xl hover:bg-red-pale transition-all duration-300 text-left group"
                            >
                                <h3 className="font-heading text-2xl text-dark group-hover:text-red transition-colors">
                                    Normalisation Form
                                </h3>
                                <p className="text-gray text-sm mt-2">Database normalisation documentation and diagram</p>
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => setSelectedDiagram(null)}
                                className="text-red hover:text-red-dark font-semibold mb-6 flex items-center gap-2 transition-colors"
                            >
                                ← Back to Diagrams
                            </button>

                            {/* ER Diagram View */}
                            {selectedDiagram === 'er' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-heading text-3xl text-dark mb-4">ER Diagram</h3>
                                        <div className="bg-gray-50 rounded-xl p-6 flex justify-center">
                                            <img
                                                src="/diagrams/er.png"
                                                alt="ER Diagram"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Relational Schema View */}
                            {selectedDiagram === 'schema' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-heading text-3xl text-dark mb-4">Relational Schema</h3>
                                        <div className="bg-gray-50 rounded-xl p-6 flex justify-center">
                                            <img
                                                src="/diagrams/schem.png"
                                                alt="Relational Schema"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Normalised Form View */}
                            {selectedDiagram === 'normal' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-heading text-3xl text-dark mb-6">Database Normalization Report (UP TO 3NF)</h3>

                                        {/* Normalization Content */}
                                        <div className="bg-red-pale border-l-4 border-red p-6 rounded-r-lg mb-8">
                                            <h4 className="font-heading text-2xl text-dark mb-4">1. Introduction</h4>
                                            <p className="text-gray text-sm leading-relaxed">
                                                This report presents the normalization of the given database schema up to the Third Normal Form (3NF). The objective of normalization is to eliminate redundancy, avoid anomalies, and ensure data integrity by organizing attributes and relations based on functional dependencies.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Initial Relations */}
                                            <div>
                                                <h4 className="font-heading text-xl text-dark mb-3">2. Initial Relations</h4>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm space-y-2">
                                                    <p><span className="font-bold text-red">USER</span>(uid, name, createdAt, role, email, profile_complete)</p>
                                                    <p><span className="font-bold text-red">ADMIN</span>(aid, uid, donorid)</p>
                                                    <p><span className="font-bold text-red">DONOR</span>(donorid, fullname, phone, bloodType, city, age, haemoglobin, weight, consentCheckbox, lastDate, substanceuse)</p>
                                                    <p><span className="font-bold text-red">BLOOD_REQUEST</span>(id, patientname, createdAt, hospitalname, urgency, status, units, bloodType, contactno)</p>
                                                </div>
                                            </div>

                                            {/* Functional Dependencies */}
                                            <div>
                                                <h4 className="font-heading text-xl text-dark mb-3">3. Functional Dependencies</h4>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-3">
                                                    <div>
                                                        <p className="font-semibold text-dark mb-2">Primary Dependencies:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-gray">
                                                            <li>uid → name, createdAt, role, email, profile_complete</li>
                                                            <li>aid → uid, donorid</li>
                                                            <li>donorid → fullname, phone, bloodType, city, age, haemoglobin, weight, consentCheckbox, lastDate, substanceuse</li>
                                                            <li>id → patientname, createdAt, hospitalname, urgency, status, units, bloodType, contactno</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 1NF Analysis */}
                                            <div>
                                                <h4 className="font-heading text-xl text-dark mb-3">4. First Normal Form (1NF)</h4>
                                                <p className="text-gray text-sm mb-3"><span className="font-semibold">Violations Identified:</span> Composite attributes (fullname, city) and multi-valued attributes (substanceuse)</p>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm space-y-2">
                                                    <p><span className="font-bold text-red">DONOR</span>(donorid, first_name, last_name, phone, bloodType, age, haemoglobin, weight, consentCheckbox, lastDate)</p>
                                                    <p><span className="font-bold text-red">DONOR_ADDRESS</span>(donorid, city_name, state, pincode)</p>
                                                    <p><span className="font-bold text-red">DONOR_SUBSTANCE</span>(donorid, substance_type)</p>
                                                </div>
                                            </div>

                                            {/* 2NF Analysis */}
                                            <div>
                                                <h4 className="font-heading text-xl text-dark mb-3">5. Second Normal Form (2NF)</h4>
                                                <p className="text-gray text-sm">
                                                    All relations have single-attribute primary keys. Since there are no composite primary keys, partial dependencies do not exist. <span className="font-semibold text-red">Result: All relations are in 2NF.</span>
                                                </p>
                                            </div>

                                            {/* 3NF Analysis */}
                                            <div>
                                                <h4 className="font-heading text-xl text-dark mb-3">6. Third Normal Form (3NF)</h4>
                                                <p className="text-gray text-sm mb-3">Transitive dependencies eliminated:</p>
                                                <ul className="list-disc list-inside space-y-2 text-gray text-sm">
                                                    <li><span className="font-semibold">DONOR_ADDRESS:</span> pincode → city_name, state (separate PINCODE relation created)</li>
                                                    <li><span className="font-semibold">BLOOD_REQUEST:</span> hospitalname → address (separate HOSPITAL relation created)</li>
                                                </ul>
                                            </div>

                                            {/* Final Schema */}
                                            <div className="bg-red-pale border-l-4 border-red p-6 rounded-r-lg">
                                                <h4 className="font-heading text-xl text-dark mb-4">7. Final 3NF Schema</h4>
                                                <div className="font-mono text-xs space-y-1">
                                                    <p><span className="font-bold text-red">USER</span>(uid, name, createdAt, role, email, profile_complete)</p>
                                                    <p><span className="font-bold text-red">ADMIN</span>(aid, uid, donorid)</p>
                                                    <p><span className="font-bold text-red">DONOR</span>(donorid, first_name, last_name, phone, bloodType, age, haemoglobin, weight, consentCheckbox, lastDate)</p>
                                                    <p><span className="font-bold text-red">DONOR_ADDRESS</span>(donorid, pincode)</p>
                                                    <p><span className="font-bold text-red">PINCODE</span>(pincode, city_name, state)</p>
                                                    <p><span className="font-bold text-red">DONOR_SUBSTANCE</span>(donorid, substance_type)</p>
                                                    <p><span className="font-bold text-red">BLOOD_REQUEST</span>(id, patientname, createdAt, hospital_id, urgency, status, units, bloodType, contactno)</p>
                                                    <p><span className="font-bold text-red">HOSPITAL</span>(hospital_id, hospitalname, address)</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Normalization Diagram */}
                                        <div className="mt-8">
                                            <h4 className="font-heading text-xl text-dark mb-4">Normalisation Diagram</h4>
                                            <div className="bg-gray-50 rounded-xl p-6 flex justify-center">
                                                <img
                                                    src="/diagrams/normal.png"
                                                    alt="Normalised Form Diagram"
                                                    className="max-w-full h-auto rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
