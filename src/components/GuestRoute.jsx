import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GuestRoute prevents authenticated users from accessing
 * public-only pages like /login or /register.
 */
const GuestRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                    style={{ borderColor: '#0284c7', borderTopColor: 'transparent' }}
                />
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect logged-in users to the dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Render child routes (login/register)
    return <Outlet />;
};

export default GuestRoute;
