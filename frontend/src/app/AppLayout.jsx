import React from 'react'
import Nav from '../features/Shared/Components/Nav'
import { Outlet } from 'react-router'
import { useSocket } from '../features/Shared/hooks/useSocket'

const AppLayout = () => {
    // Initialize socket connection globally
    useSocket();

    return (
        <>
            <Nav />
            <Outlet />
        </>
    )
}

export default AppLayout