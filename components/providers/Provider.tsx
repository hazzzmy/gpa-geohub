'use client'

import React from 'react'

interface ProviderProps {
    children: React.ReactNode
}

const Provider: React.FC<ProviderProps> = ({ children }) => {
    return <>{children}</>
}

export default Provider