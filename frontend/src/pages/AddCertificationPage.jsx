import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { IoSearch } from "react-icons/io5";
import { PDFViewer } from '@react-pdf/renderer';

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import SearchDropdown from '../components/SearchDropdown';
import SearchModal from '../components/SearchModal';
import CertificatePreview from '../components/CertificatePreview';
import { useAuth } from '../components/AuthContext';

const AddCertificationPage = () => {
    // State Management
    const [errorMessage, setErrorMessage] = useState(null);
    const [certificateTypes, setCertificateTypes] = useState([]);
    const [brgyOfficials, setBrgyOfficials] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedCertificateType, setSelectedCertificateType] = useState(null);
    const [isComplainantModalOpen, setIsComplainantModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        // Common fields
        certificateType: null,
        issuanceDate: '',
        complainantName: '',
        complainantMiddleName: '',
        complainantAddress: '',
        complainantContact: '',
        complainantAge: '',
        civilStatus: '',

        // Certificate-specific fields
        businessName: '',
        businessAddress: '',
        closureDate: '',
        purpose: '',
        deceasedName: '',
        dateOfDeath: '',
        placeOfDeath: '',
        relationship: '',
        lotLocation: '',
        permitType: '',
        solo_parent_type: '',
        calamity_type: '',
    });

    const { barangayId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchCertificateType(),
                    fetchBarangayOfficials()
                ]);
            } catch (error) {
                setErrorMessage("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [barangayId]);

    const fetchCertificateType = async () => {
        try {
            const response = await axios.get("http://localhost:8080/certificate/", {
                withCredentials: true,
            });
            setCertificateTypes(response.data);
        } catch (error) {
            console.error("Error fetching certificate types:", error);
            setErrorMessage("Failed to fetch certificate types");
        }
    };

    const fetchBarangayOfficials = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/official/${barangayId}`, {
                withCredentials: true,
            });
            setBrgyOfficials(response.data);
        } catch (error) {
            console.error('Error fetching barangay officials:', error);
            setErrorMessage('Failed to fetch barangay officials');
        }
    };

    const handleCertificateTypeChange = (selectedValue) => {
        const selectedCertificate = certificateTypes.find(cert => cert.iid === selectedValue.iid);

        // Reset form data when certificate type changes
        setFormData(prev => ({
            certificateType: selectedCertificate,
            issuanceDate: '',
            complainantName: '',
            complainantMiddleName: '',
            complainantAddress: '',
            complainantContact: '',
            complainantAge: '',
            civilStatus: '',
            businessName: '',
            businessAddress: '',
            closureDate: '',
            purpose: '',
            deceasedName: '',
            dateOfDeath: '',
            placeOfDeath: '',
            relationship: '',
            lotLocation: '',
            permitType: '',
            solo_parent_type: '',
            calamity_type: '',
        }));

        setSelectedCertificateType(selectedCertificate);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectComplainant = (resident) => {
        setFormData(prev => ({
            ...prev,
            complainantName: `${resident.first_name} ${resident.last_name}`,
            complainantMiddleName: resident.middle_name || '',
            complainantAddress: `${resident.address || ""} ${resident.purok}, ${resident.barangay}`,
            complainantContact: resident.contact_number || "",
            complainantAge: resident.age || "",
            civilStatus: resident.civil_status
        }));

        setIsComplainantModalOpen(false);
    };

    const renderAdditionalFields = () => {
        if (!selectedCertificateType) return null;

        const certificateName = selectedCertificateType.iname.toLowerCase();

        switch (certificateName) {
            case 'business closure certification':
            case 'business permit certification':
                return (
                    <>
                        <div className='flex-1'>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Business Name<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                placeholder="Enter Business Name"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                value={formData.businessName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex-1'>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Business Address
                            </label>
                            <input
                                type="text"
                                name="businessAddress"
                                placeholder="Enter Business Address"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                value={formData.businessAddress}
                                onChange={handleInputChange}
                            />
                        </div>
                        {certificateName === 'business closure certification' && (
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Closure Date
                                </label>
                                <input
                                    type="date"
                                    name="closureDate"
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    value={formData.closureDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </>
                );
            case 'death certification':
                return (
                    <>
                        <div className='flex-1'>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Deceased Name<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="deceasedName"
                                placeholder="Enter Deceased Name"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                value={formData.deceasedName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex-1'>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Date of Death
                            </label>
                            <input
                                type="date"
                                name="dateOfDeath"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                value={formData.dateOfDeath}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex-1'>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Place of Death
                            </label>
                            <input
                                type="text"
                                name="placeOfDeath"
                                placeholder="Enter Place of Death"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                value={formData.placeOfDeath}
                                onChange={handleInputChange}
                            />
                        </div>
                    </>
                );
            case 'relationship certification':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Relationship<span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="relationship"
                            placeholder="Enter Relationship"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.relationship}
                            onChange={handleInputChange}
                        />
                    </div>
                );
            case 'lot certification':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Lot Location<span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="lotLocation"
                            placeholder="Enter Lot Location"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.lotLocation}
                            onChange={handleInputChange}
                        />
                    </div>
                );
            case 'electrical permit':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Permit Type<span className="text-red-600">*</span>
                        </label>
                        <select
                            name="permitType"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.permitType}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Permit Type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                    </div>
                );
            case 'solo parent certification':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Solo Parent Type<span className="text-red-600">*</span>
                        </label>
                        <select
                            name="solo_parent_type"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.solo_parent_type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Solo Parent Type</option>
                            <option value="single_parent">Single Parent</option>
                            <option value="widowed">Widowed</option>
                            <option value="separated">Separated</option>
                            <option value="solo_by_choice">Solo by Choice</option>
                        </select>
                    </div>
                );
            case 'calamity certification':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Calamity Type<span className="text-red-600">*</span>
                        </label>
                        <select
                            name="calamity_type"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.calamity_type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Calamity Type</option>
                            <option value="flood">Flood</option>
                            <option value="fire">Fire</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="typhoon">Typhoon</option>
                            <option value="landslide">Landslide</option>
                        </select>
                    </div>
                );
            case 'indigency certification':
            case 'unemployment certification':
                return (
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Purpose<span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="purpose"
                            placeholder="Enter Purpose"
                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            value={formData.purpose}
                            onChange={handleInputChange}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderCertificateMessage = useMemo(() => {
        if (!selectedCertificateType || !brgyOfficials.length) {
            return "Please select a certificate type first";
        }

        let message = selectedCertificateType.body_text || '';

        // Dynamic replacements based on certificate type
        return message
            .replace('[BARANGAY_CAPTAIN]', brgyOfficials[0].full_name)
            .replace('[APPLICANT_NAME]', formData.complainantName)
            .replace('[BUSINESS_NAME]', formData.businessName || '')
            .replace('[ADDRESS]', formData.complainantAddress || '')
            .replace('[DATE]', new Date().getDate() + ['th', 'st', 'nd', 'rd'][((new Date().getDate() % 10) - 1 + 10) % 10] || 'th')
            .replace('[MONTH]', new Date().toLocaleString('default', { month: 'long' }))
            .replace('[YEAR]', new Date().getFullYear().toString())
            .replace('[CIVIL_STATUS]', formData.civilStatus)
            .replace('[AGE]', formData.complainantAge)
            .replace('[PURPOSE]', formData.purpose || '')
            .replace('[DECEASED_NAME]', formData.deceasedName || '')
            .replace('[PLACE_OF_DEATH]', formData.placeOfDeath || '')
            .replace('[LOT_LOCATION]', formData.lotLocation || '')
            .replace('[RELATIONSHIP]', formData.relationship || '')
            .replace('[CLOSURE_DATE]', new Date(formData.closureDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }));

    }, [selectedCertificateType, brgyOfficials, formData]);

    // Render
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <div className="mx-auto bg-white p-10 rounded-lg">
                            <div className="mb-6 leading-3">
                                <h1 className="text-xl font-semibold text-gray-500">Add Certification</h1>
                                <p className="text-sm text-gray-400 mt-2">
                                    Fill out the form below to add a new certificate to the system.
                                </p>
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                            )}

                            <div className="col-span-1 md:col-span-3 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Certification Type<span className="text-red-600">*</span>
                                        </label>
                                        <SearchDropdown
                                            onSelect={handleCertificateTypeChange}
                                            options={certificateTypes}
                                            uniqueKey={'iname'}
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Issuance Date<span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type='date'
                                            name="issuanceDate"
                                            value={formData.issuanceDate}
                                            onChange={handleInputChange}
                                            className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Name<span className="text-red-600">*</span>
                                        </label>
                                        <div className="relative rounded-md">
                                            <input
                                                type="text"
                                                name="complainantName"
                                                placeholder="Type or Search Complainant Name"
                                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                                value={formData.complainantName}
                                                onChange={handleInputChange}
                                            />
                                            <div
                                                className="h-full w-9 absolute flex items-center justify-center right-0 top-0 bg-blue-600 cursor-pointer rounded-r-md"
                                                onClick={() => setIsComplainantModalOpen((prev) => !prev)}
                                            >
                                                <IoSearch className="w-5 h-5 text-white" />
                                            </div>
                                            <SearchModal
                                                title="Select Complainant"
                                                isOpen={isComplainantModalOpen}
                                                onClose={() => setIsComplainantModalOpen(false)}
                                                onSelect={handleSelectComplainant}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Middle Name<span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="complainantMiddleName"
                                            placeholder="Type Middle Name"
                                            className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.complainantMiddleName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Age
                                        </label>
                                        <input
                                            type="text"
                                            name="complainantAge"
                                            placeholder="Type Age"
                                            className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.complainantAge}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">
                                            Address<span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="complainantAddress"
                                            placeholder="Type Address"
                                            className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.complainantAddress}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {renderAdditionalFields()}
                                </div>


                                <div className='grid grid-cols-1'>
                                    <label className="block mb-2 text-sm font-medium text-gray-500">
                                        Purpose<span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        className="border text-sm border-gray-300 p-2 h-32 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={renderCertificateMessage}
                                        readOnly
                                    />

                                    <PDFViewer style={{ width: '100%', height: '100vh' }}>
                                        <CertificatePreview
                                            message={renderCertificateMessage}
                                            brgyOfficials={brgyOfficials}
                                            certificateTitle={selectedCertificateType?.iname || ''}
                                            date={formData.issuanceDate
                                                ? new Date(formData.issuanceDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : new Date().toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                            }
                                        />
                                    </PDFViewer>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddCertificationPage;