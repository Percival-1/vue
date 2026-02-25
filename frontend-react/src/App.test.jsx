import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
    it('renders welcome message', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )

        expect(screen.getByText(/Agri-Civic Intelligence Platform/i)).toBeInTheDocument()
    })
})
