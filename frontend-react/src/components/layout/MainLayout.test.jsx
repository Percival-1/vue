import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MainLayout from './MainLayout';
import authReducer from '../../store/slices/authSlice';
import userReducer from '../../store/slices/userSlice';
import notificationReducer from '../../store/slices/notificationSlice';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        logout: vi.fn(),
    }),
}));

describe('MainLayout Component', () => {
    const renderMainLayout = () => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
                user: userReducer,
                notifications: notificationReducer,
            },
            preloadedState: {
                auth: {
                    isAuthenticated: true,
                    user: {
                        name: 'Test User',
                        phone_number: '+1234567890',
                    },
                    token: 'test-token',
                },
                user: {
                    preferences: {
                        language: 'en',
                    },
                },
                notifications: {
                    items: [],
                    unreadCount: 0,
                },
            },
        });

        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <MainLayout />
                </BrowserRouter>
            </Provider>
        );
    };

    it('renders MainLayout with Header and Sidebar', () => {
        renderMainLayout();
        // Check if header is rendered
        expect(screen.getByText('Agri-Civic Intelligence')).toBeInTheDocument();
        // Check if sidebar navigation items are rendered
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders content area with Outlet', () => {
        renderMainLayout();
        // The main content area should be present
        const main = document.querySelector('main');
        expect(main).toBeInTheDocument();
    });
});
