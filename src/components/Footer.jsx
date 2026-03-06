import { Link } from 'react-router-dom';
import { Calendar, Mail, Github, Twitter, Instagram, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-900/20 group-hover:scale-110 transition-transform">
                                <Calendar size={24} />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">EventManager</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400">
                            The world's most intuitive platform for creating, discovering, and sharing amazing experiences. Built for organizers, loved by attendees.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all">
                                <Twitter size={16} />
                            </a>
                            <a href="https://github.com/zaakir10" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all">
                                <Github size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all">
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/events" className="hover:text-sky-400 transition-colors">Browse Events</Link></li>
                            <li><Link to="/manage-events" className="hover:text-sky-400 transition-colors">Host an Event</Link></li>
                            <li><Link to="/tasks" className="hover:text-sky-400 transition-colors">Task Board</Link></li>
                            <li><Link to="/dashboard" className="hover:text-sky-400 transition-colors">Organizer Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Resources</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">Stay Updated</h3>
                        <p className="text-sm text-slate-400">Get the latest event news and updates delivered to your inbox.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                            />
                            <button className="absolute right-2 top-2 p-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} EventManager Inc. All rights reserved. Built with ❤️ by Zaakir.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Systems Operational
                        </span>
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
