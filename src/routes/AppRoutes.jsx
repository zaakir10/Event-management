import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

// Public pages
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Events from '../pages/Events';
import EventDetail from '../pages/EventDetail';

// Protected pages
import Dashboard from '../pages/Dashboard';
import Tasks from '../pages/Tasks';
import Profile from '../pages/Profile';
import MyTickets from '../pages/MyTickets';
import ManageEvents from '../pages/ManageEvents';

const AppRoutes = () => (
    <Routes>
        {/* ── Public (Always accessible) ───────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        {/* ── Guest Only (Lock if logged in) ──────────── */}
        <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Route>

        {/* ── Protected (any logged-in user) ──────── */}
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/manage-events" element={<ManageEvents />} />
        </Route>

        {/* ── 404 fallback ────────────────────────── */}
        <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-6xl font-extrabold text-slate-800 mb-3">404</h1>
                <p className="text-slate-500 text-lg mb-6">Page not found</p>
                <a href="/" className="px-6 py-2.5 text-white rounded-xl font-bold"
                    style={{ backgroundColor: '#0284c7' }}>Go Home</a>
            </div>
        } />
    </Routes>
);

export default AppRoutes;
