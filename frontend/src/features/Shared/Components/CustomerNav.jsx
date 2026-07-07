import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

const CustomerNav = () => {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart?.items)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { handleLogout } = useAuth()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/')
        }
    }

    const onLogout = async () => {
        await handleLogout()
        setIsDropdownOpen(false)
        navigate('/')
    }

    return (
        <nav className="px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between border-b border-snitch-border relative">
            <Link to="/"
                className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity font-display text-snitch-accent"
            >
                Snitch.
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 w-full hidden md:block">
                <input
                    type="text"
                    placeholder="Search archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-snitch-primary outline-none pb-2 text-sm px-2 text-center placeholder-gray-400 text-snitch-primary"
                />
            </form>

            <div className="flex gap-6 items-center text-[10px] uppercase tracking-[0.2em] font-medium text-snitch-muted">
                {user ? (
                    <>
                        {/* User Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="transition-colors hover:text-snitch-accent flex items-center gap-1 text-snitch-primary"
                            >
                                {user.fullname}
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
                                        className="absolute right-0 mt-4 w-48 bg-white border border-snitch-border shadow-lg py-2 z-50 flex flex-col"
                                    >
                                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 hover:bg-gray-50 transition-colors text-left text-snitch-primary">Profile</Link>
                                        <Link to="/order-success" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 hover:bg-gray-50 transition-colors text-left text-snitch-primary">Orders</Link>
                                        <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 hover:bg-gray-50 transition-colors text-left text-snitch-primary">Wishlist</Link>
                                        <div className="border-t border-snitch-border my-1"></div>
                                        <button onClick={onLogout} className="px-4 py-3 hover:bg-gray-50 transition-colors text-left text-snitch-primary">Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link
                            to="/cart"
                            className="relative flex items-center hover:opacity-70 transition-opacity text-snitch-primary"
                            aria-label="Shopping cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {cartItems?.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-white bg-snitch-accent w-4 h-4 text-[9px] font-body"
                                >
                                    {cartItems.length > 9 ? '9+' : cartItems.length}
                                </motion.span>
                            )}
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="transition-colors hover:text-[#C9A96E]">Sign In</Link>
                        <Link to="/register" className="transition-colors hover:text-[#C9A96E]">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default CustomerNav
