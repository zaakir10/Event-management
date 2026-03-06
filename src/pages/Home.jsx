import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, TrendingUp, Calendar, Ticket } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useTickets } from '../context/TicketContext';
import { useEffect } from 'react';
import EventCard from '../components/EventCard';

const FEATURES = [
    {
        icon: <Calendar size={28} />,
        title: 'Event Management',
        desc: 'Organizers can create, update, and manage events with ease. Draft or publish when ready.',
        color: 'text-indigo-600 bg-indigo-50',
    },
    {
        icon: <Ticket size={28} />,
        title: 'Ticket Booking',
        desc: 'Attendees can book tickets, view them in their dashboard, and access unique QR codes.',
        color: 'text-rose-600 bg-rose-50',
    },
    {
        icon: <Shield size={28} />,
        title: 'Secure by Design',
        desc: 'Row Level Security on every table. Your data is yours — no one else can see it.',
        color: 'text-sky-600 bg-sky-50',
    },
    {
        icon: <TrendingUp size={28} />,
        title: 'Visual Analytics',
        desc: 'Dashboard charts give you a clear picture of your activity, priorities, and progress.',
        color: 'text-emerald-600 bg-emerald-50',
    },
];

const STEPS = [
    { step: '01', title: 'Find an Event', desc: 'Browse our curated list of upcoming workshops, concerts, and meetups.' },
    { step: '02', title: 'Book Your Spot', desc: 'Secure your ticket instantly with our seamless booking process.' },
    { step: '03', title: 'Attend & Scan', desc: 'Get your unique QR code and show it at the door for entry.' },
];

const Home = () => {
    const { events, fetchPublicEvents, loading } = useEvents();
    const { fetchMyTickets } = useTickets();

    useEffect(() => {
        fetchPublicEvents();
        fetchMyTickets();
    }, [fetchPublicEvents, fetchMyTickets]);

    const featuredEvents = events
        .filter(e => e.status === 'published')
        .slice(0, 3);

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)]">

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-24 lg:py-36">
                {/* Gradient blobs */}
                <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
                <div className="pointer-events-none absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-sm font-semibold">
                        <CheckCircle size={14} /> Production-ready · React + Supabase
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
                        Experience events<br />
                        <span style={{ color: '#0284c7' }}>without the friction</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed">
                        The all-in-one platform to discover amazing events and manage your tickets with ease.
                        From workshops to concerts, your next experience starts here.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/events"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all text-base"
                            style={{ backgroundColor: '#0284c7', boxShadow: '0 4px 24px rgba(2,132,199,0.35)' }}
                        >
                            Book Tickets Now <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 transition-all text-base shadow-sm"
                        >
                            Explore Platform
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Featured Events Strip ────────────────────────────────────────── */}
            {featuredEvents.length > 0 && (
                <section className="py-24 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Upcoming Experiences</h2>
                                <p className="text-slate-500 text-lg">Spotlight on some of the best events happening soon.</p>
                            </div>
                            <Link to="/events" className="group flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 transition-all">
                                View all {events.length} events <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                </section>
            )}



            {/* ── Features grid ───────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">Everything you need</h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">
                            Built with real-world features that you'd find in production SaaS products.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="p-6 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group"
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ────────────────────────────────────────────────── */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">Up and running in minutes</h2>
                        <p className="text-slate-500 text-lg">Three steps to full productivity.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {STEPS.map((s, i) => (
                            <div key={s.step} className="relative">
                                {i < STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] right-0 h-px bg-slate-200" />
                                )}
                                <div className="text-center">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-5 shadow-md"
                                        style={{ backgroundColor: '#0284c7' }}
                                    >
                                        {s.step}
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">{s.title}</h3>
                                    <p className="text-slate-500">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA banner ──────────────────────────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6">
                <div
                    className="max-w-5xl mx-auto rounded-[40px] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-sky-200"
                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white, transparent)' }} />
                    <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
                        Ready for your next experience?
                    </h2>
                    <p className="text-sky-100 text-xl font-medium mb-10 relative z-10 max-w-xl mx-auto leading-relaxed">
                        Join thousands of event-goers and start discovering amazing events today. Free, fast, and fully secure.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white font-black rounded-2xl hover:bg-sky-50 transition-all shadow-xl text-lg active:scale-95"
                        style={{ color: '#0284c7' }}
                    >
                        Create Free Account <ArrowRight size={22} />
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Home;
