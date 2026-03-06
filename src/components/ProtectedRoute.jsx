import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Used as a layout route in AppRoutes:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/dashboard" element={<Dashboard />} />
//   </Route>
//
// It renders <Outlet /> (child routes) when authenticated,
// or redirects to /login when not.

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // While auth state is being resolved, show a spinner
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

    if (!isAuthenticated) {
        // Preserve the URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;
