import { lazy } from 'react';

/**
 * Route Configuration
 * 
 * This file defines all application routes with lazy loading for code splitting.
 * Routes are organized by:
 * - Public routes (auth pages)
 * - Protected routes (user pages)
 * - Admin routes (admin pages)
 * 
 * Lazy loading improves initial load time by splitting code into chunks
 * that are loaded on demand when routes are accessed.
 */

// ============================================================================
// Lazy-loaded Page Components
// ============================================================================

// Auth Pages
export const Login = lazy(() => import('../pages/auth/Login'));
export const Register = lazy(() => import('../pages/auth/Register'));
export const ProfileCompletion = lazy(() => import('../pages/auth/ProfileCompletion'));

// User Pages
export const Dashboard = lazy(() => import('../pages/user/Dashboard'));
export const Profile = lazy(() => import('../pages/user/Profile'));
export const Chat = lazy(() => import('../pages/user/Chat'));
export const DiseaseDetection = lazy(() => import('../pages/user/DiseaseDetection'));
export const Weather = lazy(() => import('../pages/user/Weather'));
export const Market = lazy(() => import('../pages/user/Market'));
export const Schemes = lazy(() => import('../pages/user/Schemes'));
export const Notifications = lazy(() => import('../pages/user/Notifications'));
export const SpeechServices = lazy(() => import('../pages/user/SpeechServices'));

// Admin Pages
export const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
export const Users = lazy(() => import('../pages/admin/Users'));
export const UserDetails = lazy(() => import('../pages/admin/UserDetails'));
export const Monitoring = lazy(() => import('../pages/admin/Monitoring'));
export const Translation = lazy(() => import('../pages/admin/Translation'));
export const SMSManagement = lazy(() => import('../pages/admin/SMSManagement'));
export const CacheManagement = lazy(() => import('../pages/admin/CacheManagement'));
export const Performance = lazy(() => import('../pages/admin/Performance'));
export const PortalSync = lazy(() => import('../pages/admin/PortalSync'));
export const KnowledgeBase = lazy(() => import('../pages/admin/KnowledgeBase'));
export const LLMManagement = lazy(() => import('../pages/admin/LLMManagement'));

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Public Routes
 * Accessible without authentication
 */
export const publicRoutes = [
    {
        path: '/login',
        element: Login,
        title: 'Login',
    },
    {
        path: '/register',
        element: Register,
        title: 'Register',
    },
];

/**
 * Protected Routes
 * Require authentication
 */
export const protectedRoutes = [
    {
        path: '/',
        element: Dashboard,
        title: 'Dashboard',
    },
    {
        path: '/dashboard',
        element: Dashboard,
        title: 'Dashboard',
    },
    {
        path: '/profile',
        element: Profile,
        title: 'Profile',
    },
    {
        path: '/profile-completion',
        element: ProfileCompletion,
        title: 'Complete Profile',
    },
    {
        path: '/chat',
        element: Chat,
        title: 'Chat Assistant',
    },
    {
        path: '/disease-detection',
        element: DiseaseDetection,
        title: 'Disease Detection',
    },
    {
        path: '/weather',
        element: Weather,
        title: 'Weather',
    },
    {
        path: '/market',
        element: Market,
        title: 'Market Intelligence',
    },
    {
        path: '/schemes',
        element: Schemes,
        title: 'Government Schemes',
    },
    {
        path: '/notifications',
        element: Notifications,
        title: 'Notifications',
    },
    {
        path: '/speech',
        element: SpeechServices,
        title: 'Speech Services',
    },
];

/**
 * Admin Routes
 * Require authentication and admin role
 */
export const adminRoutes = [
    {
        path: '/admin',
        element: AdminDashboard,
        title: 'Admin Dashboard',
    },
    {
        path: '/admin/dashboard',
        element: AdminDashboard,
        title: 'Admin Dashboard',
    },
    {
        path: '/admin/users',
        element: Users,
        title: 'User Management',
    },
    {
        path: '/admin/users/:userId',
        element: UserDetails,
        title: 'User Details',
    },
    {
        path: '/admin/monitoring',
        element: Monitoring,
        title: 'System Monitoring',
    },
    {
        path: '/admin/translation',
        element: Translation,
        title: 'Translation Service',
    },
    {
        path: '/admin/sms',
        element: SMSManagement,
        title: 'SMS Management',
    },
    {
        path: '/admin/cache',
        element: CacheManagement,
        title: 'Cache Management',
    },
    {
        path: '/admin/performance',
        element: Performance,
        title: 'Performance Monitoring',
    },
    {
        path: '/admin/portal-sync',
        element: PortalSync,
        title: 'Portal Synchronization',
    },
    {
        path: '/admin/knowledge-base',
        element: KnowledgeBase,
        title: 'Knowledge Base',
    },
    {
        path: '/admin/llm',
        element: LLMManagement,
        title: 'LLM Management',
    },
];

/**
 * Get all routes grouped by type
 */
export const getAllRoutes = () => ({
    public: publicRoutes,
    protected: protectedRoutes,
    admin: adminRoutes,
});

/**
 * Get route by path
 */
export const getRouteByPath = (path) => {
    const allRoutes = [...publicRoutes, ...protectedRoutes, ...adminRoutes];
    return allRoutes.find((route) => route.path === path);
};

/**
 * Check if path is public route
 */
export const isPublicRoute = (path) => {
    return publicRoutes.some((route) => route.path === path);
};

/**
 * Check if path is admin route
 */
export const isAdminRoute = (path) => {
    return adminRoutes.some((route) => route.path === path || path.startsWith(route.path));
};
