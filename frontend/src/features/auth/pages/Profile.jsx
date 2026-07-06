import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';
import { useNavigate } from 'react-router';

const Profile = () => {
    const user = useSelector(state => state.auth.user);
    const { handleUpdateProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        contact: '',
        address: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setFormData({
                fullname: user.fullname || '',
                email: user.email || '',
                contact: user.contact || '',
                address: user.address || ''
            });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            await handleUpdateProfile({
                fullname: formData.fullname,
                contact: formData.contact,
                address: formData.address
            });
            setMessage('Profile updated successfully.');
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen py-24 selection:bg-[#C9A96E]/30" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-3xl mx-auto px-6 md:px-12">
                <div className="mb-12 text-center">
                    <span className="uppercase tracking-[0.2em] text-[10px]" style={{ color: '#7A6E63' }}>
                        Account Settings
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-light mt-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                        Your Profile
                    </h1>
                </div>

                <div className="bg-white p-8 md:p-12 shadow-sm border" style={{ borderColor: '#e4e2df' }}>
                    {message && (
                        <div className="mb-6 p-4 text-sm text-center border" style={{ borderColor: '#C9A96E', color: '#745a27', backgroundColor: '#fdfcf9' }}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b outline-none py-2 text-sm focus:border-[#C9A96E] transition-colors"
                                    style={{ borderColor: '#1b1c1a', color: '#1b1c1a' }}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-transparent border-b outline-none py-2 text-sm opacity-50 cursor-not-allowed"
                                    style={{ borderColor: '#1b1c1a', color: '#1b1c1a' }}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Email cannot be changed.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>Contact Number</label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b outline-none py-2 text-sm focus:border-[#C9A96E] transition-colors"
                                style={{ borderColor: '#1b1c1a', color: '#1b1c1a' }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>Shipping Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-transparent border-b outline-none py-2 text-sm focus:border-[#C9A96E] transition-colors resize-none"
                                style={{ borderColor: '#1b1c1a', color: '#1b1c1a' }}
                            />
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 text-xs uppercase tracking-[0.2em] transition-all duration-300"
                                style={{
                                    backgroundColor: '#745a27',
                                    color: '#ffffff',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
