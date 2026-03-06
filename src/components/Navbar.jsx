import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckSquare, LayoutDashboard, User, LogOut, LogIn,
    UserPlus, Menu, X, Calendar, Ticket, Settings, CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Nav link definitions ─────────────────────────────────────────────────────
const PUBLIC_LINKS = [
    { path: '/events', name: 'Browse Events', icon: <CalendarDays size={17} /> },
    { path: '/my-tickets', name: 'My Tickets', icon: <Ticket size={17} /> },
];

const AUTH_LINKS = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { path: '/events', name: 'Book Tickets', icon: <CalendarDays size={17} /> },
    { path: '/my-tickets', name: 'My Tickets', icon: <Ticket size={17} /> },
    { path: '/manage-events', name: 'Manage Events', icon: <Settings size={17} /> },
];

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/');
        } catch {
            toast.error('Logout failed');
        }
    };

    const links = isAuthenticated ? AUTH_LINKS : PUBLIC_LINKS;

    return (
        <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex items-center gap-2 font-extrabold text-xl"
                        onClick={() => setMenuOpen(false)}>
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                            style={{ backgroundColor: '#0284c7' }}>
                            <Calendar size={16} />
                        </span>
                        <span className="text-slate-800">Event<span style={{ color: '#0284c7' }}>Manager</span></span>
                    </Link>

                    {/* ── Desktop nav links ── */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${isActive(link.path)
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                {link.icon} {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* ── Desktop right side ── */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${isActive('/profile') ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                                        }`}>
                                    {user?.user_metadata?.avatar_url ? (
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-sky-100">
                                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <User size={17} />
                                    )}
                                    <span className="max-w-[100px] truncate">
                                        {user?.user_metadata?.full_name?.split(' ')[0] || 'Profile'}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={17} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all">
                                    <LogIn size={17} /> Login
                                </Link>
                                <Link to="/register"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90"
                                    style={{ backgroundColor: '#0284c7' }}>
                                    <UserPlus size={17} /> Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
                    {links.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive(link.path)
                                ? 'bg-sky-50 text-sky-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {link.icon} {link.name}
                        </Link>
                    ))}

                    <div className="border-t border-slate-100 pt-2 mt-2">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">
                                    {user?.user_metadata?.avatar_url ? (
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-100">
                                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <User size={17} />
                                    )}
                                    Profile
                                </Link>
                                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                                    <LogOut size={17} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">
                                    <LogIn size={17} /> Login
                                </Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white rounded-xl mt-1"
                                    style={{ backgroundColor: '#0284c7' }}>
                                    <UserPlus size={17} /> Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
