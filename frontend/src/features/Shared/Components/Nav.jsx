import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'

const Nav = () => {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)



    return (
        <nav className="px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex items-center justify-between border-b" style={{ borderColor: '#e4e2df' }}>
            <Link to="/"
                className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
            >
                Snitch.
            </Link>
            <div className="flex gap-6 items-center text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#7A6E63' }}>
                {user ? (
                    <>
                        <span style={{ color: '#1b1c1a' }}>{user.fullname}</span>
                        {user.role === 'seller' && (
                            <Link to="/seller/dashboard" className="transition-colors hover:text-[#C9A96E]">Seller Dashboard</Link>
                        )}
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

export default Nav