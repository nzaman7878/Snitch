import React from 'react'
import { useSelector } from 'react-redux'
import CustomerNav from './CustomerNav'
import SellerNav from './SellerNav'

const Nav = () => {
    const user = useSelector(state => state.auth.user)

    if (user?.role === 'seller') {
        return <SellerNav />
    }

    return <CustomerNav />
}

export default Nav