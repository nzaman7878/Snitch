import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

const SellerNav = () => {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { handleLogout } = useAuth()

    const onLogout = async () => {
        await handleLogout()
        setIsDropdownOpen(false)
        navigate('/')
    }

    return (
        <nav className="px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between border-b border-[#e5e1da] bg-[#fbf9f6] relative z-20">
            <Link to="/seller/dashboard"
                className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
            >
                Snitch. <span className="text-[10px] tracking-[0.2em] text-[#7A6E63] ml-2 font-sans">Seller</span>
            </Link>

            <div className="flex-1 max-w-md mx-8 w-full hidden md:block">
                {/* Empty spacer for alignment, seller dashboard has its own search */}
            </div>

            <div className="flex gap-8 items-center text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">
                <Link to="/seller/dashboard" className="transition-colors hover:text-[#C9A96E]">Dashboard</Link>
                <Link to="/seller/orders" className="transition-colors hover:text-[#C9A96E]">Orders</Link>
                <Link to="/seller/analytics" className="transition-colors hover:text-[#C9A96E]">Analytics</Link>
                
                {/* User Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="transition-colors hover:text-[#C9A96E] flex items-center gap-1 text-[#1b1c1a]"
                    >
                        {user?.fullname || 'Seller'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="absolute right-0 mt-4 w-48 bg-[#ffffff] border border-[#e5e1da] shadow-lg py-2 z-50 flex flex-col font-sans"
                            >
                                <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 hover:bg-[#fbf9f6] transition-colors text-left text-[#1b1c1a]">Profile</Link>
                                <div className="border-t border-[#e5e1da] my-1"></div>
                                <button onClick={onLogout} className="px-4 py-3 hover:bg-[#fbf9f6] transition-colors text-left text-[#1b1c1a]">Logout</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    )
}

export default SellerNav
