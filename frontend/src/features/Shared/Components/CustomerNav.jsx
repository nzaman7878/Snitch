import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProducts } from '../../products/service/product.api'

const CustomerNav = () => {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart?.items)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { handleLogout } = useAuth()
    
    const searchRef = useRef(null)

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true)
                try {
                    const data = await getAllProducts({ search: searchQuery.trim(), limit: 4 })
                    if (data?.success) {
                        setSearchResults(data.products || [])
                        setShowResults(true)
                    }
                } catch (error) {
                    console.error("Search failed", error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
                setShowResults(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            setShowResults(false)
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/shop')
        }
    }

    const onLogout = async () => {
        await handleLogout()
        setIsDropdownOpen(false)
        navigate('/')
    }

    return (
        <nav className="px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between border-b border-snitch-border relative z-50">
            <Link to="/"
                className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity font-display text-snitch-accent"
            >
                Snitch.
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8 w-full hidden md:block relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search archive..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                                    setShowResults(true)
                                }
                            }}
                            className="w-full bg-transparent border-b border-snitch-primary outline-none pb-2 text-sm px-8 text-center placeholder-gray-400 text-snitch-primary transition-colors focus:border-[#d4af37]"
                        />
                        <svg className="w-4 h-4 absolute left-0 bottom-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {isSearching && (
                            <div className="absolute right-0 bottom-2 w-4 h-4 border-2 border-gray-300 border-t-[#d4af37] rounded-full animate-spin"></div>
                        )}
                    </div>
                </form>

                {/* Live Search Results Dropdown */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-3 bg-white border border-[#e3e2e0] shadow-xl rounded-md overflow-hidden z-50"
                        >
                            {searchResults.length > 0 ? (
                                <div>
                                    <div className="p-3 bg-[#faf9f6] border-b border-[#e3e2e0]">
                                        <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#7f7663]">Top Results</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {searchResults.map(product => (
                                            <Link 
                                                key={product._id} 
                                                to={`/product/${product._id}`}
                                                onClick={() => {
                                                    setShowResults(false)
                                                    setSearchQuery('')
                                                }}
                                                className="flex items-center gap-4 p-3 hover:bg-[#faf9f6] transition-colors border-b border-[#efeeeb] last:border-none"
                                            >
                                                <div className="w-12 h-16 bg-[#f4f3f1] rounded-sm flex-shrink-0 overflow-hidden">
                                                    <img 
                                                        src={product.images?.[0]?.url || '/snitch_editorial_warm.png'} 
                                                        alt={product.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[13px] font-semibold text-[#1a1c1a] truncate">{product.title}</h4>
                                                    <p className="text-[12px] text-[#7f7663]">{product.price?.currency} {product.price?.amount?.toLocaleString()}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-[#faf9f6] border-t border-[#e3e2e0] text-center">
                                        <button 
                                            onClick={handleSearchSubmit}
                                            className="text-[11px] uppercase tracking-[0.1em] font-bold text-[#1a1c1a] hover:text-[#d4af37] transition-colors"
                                        >
                                            View All Results →
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-[#7f7663] text-[13px]">
                                    No products found for "{searchQuery}"
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                                        <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 hover:bg-gray-50 transition-colors text-left text-snitch-primary">Orders</Link>
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
