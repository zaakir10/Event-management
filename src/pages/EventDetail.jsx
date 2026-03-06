import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, MapPin, Users, Tag, ArrowLeft,
    Ticket, Loader2, AlertCircle, CheckCircle2,
    Globe, Lock
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useAlert } from '../context/AlertContext';
import toast from 'react-hot-toast';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchEventById } = useEvents();
    const { bookTicket, tickets, fetchMyTickets, fetchEventTickets, markTicketUsed, markAllTicketsUsed } = useTickets();
    const { isAuthenticated, user } = useAuth();
    const { confirm } = useAlert();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    const [attendees, setAttendees] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [batchCheckingIn, setBatchCheckingIn] = useState(false);

    const isOrganizer = user && event && user.id === event.organizer_id;

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchEventById(id);
                setEvent(data);

                // If user is organizer, fetch attendees
                if (user && data.organizer_id === user.id) {
                    loadAttendees();
                }
            } catch (err) {
                console.error("Fetch Event Error:", err);
                setError('Event not found.');
            } finally {
                setLoading(false);
            }
        };
        load();
        if (isAuthenticated) fetchMyTickets();
    }, [id, isAuthenticated, user?.id]);

    const loadAttendees = async () => {
        setLoadingAttendees(true);
        try {
            const data = await fetchEventTickets(id);
            setAttendees(data);
        } catch (err) {
            console.error("Load Attendees Error Detail:", err);
            toast.error(err.message || "Guest list details failed to load.");
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleCheckIn = async (ticketId) => {
        try {
            await markTicketUsed(ticketId);
            // Refresh local state
            setAttendees(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'used' } : t));
        } catch (err) { }
    };

    const handleCheckInAll = async () => {
        const confirmed = await confirm(
            'Check In All?',
            'Are you sure you want to mark all active attendees as checked-in?',
            'info'
        );
        if (!confirmed) return;

        setBatchCheckingIn(true);
        try {
            await markAllTicketsUsed(id);
            setAttendees(prev => prev.map(t => ({ ...t, status: 'used' })));
        } catch (err) { }
        finally { setBatchCheckingIn(false); }
    };

    const hasTicket = tickets.some(t => t.event_id === id && (t.status === 'active' || t.status === 'used'));
    const isExpired = event?.event_date && isPast(parseISO(event.event_date));

    const handleBook = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setBooking(true);
        try {
            await bookTicket(id);
        } catch { }
        finally { setBooking(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 size={40} className="animate-spin" style={{ color: '#0284c7' }} />
        </div>
    );

    if (error || !event) return (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Event Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                We couldn't find the event you're looking for. It might have been removed or you may have an incorrect link.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/events')}
                    className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
                >
                    Browse All Events
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                    Try Again
                </button>
            </div>
            {import.meta.env.DEV && (
                <p className="mt-10 text-[10px] text-slate-300 font-mono">ID: {id}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* Cover */}
            <div className="h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 shadow-2xl relative"
                style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                {event.cover_image && (
                    <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
                )}
                {isOrganizer && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" /> Organizer View
                        </span>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {event.category && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                                    <Tag size={12} /> {event.category}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${event.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {event.status === 'published' ? <Globe size={12} /> : <Lock size={12} />} {event.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-3">{event.title}</h1>
                        {event.description && (
                            <p className="text-slate-600 leading-relaxed text-lg">{event.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <InfoRow icon={<Calendar size={20} className="text-sky-500" />} label="Date & Time"
                            value={event.event_date ? format(parseISO(event.event_date), 'PPPP · p') : 'TBD'} />
                        {event.location && (
                            <InfoRow icon={<MapPin size={20} className="text-sky-500" />} label="Location" value={event.location} />
                        )}
                        {event.capacity && (
                            <InfoRow icon={<Users size={20} className="text-sky-500" />} label="Capacity" value={`${event.capacity} seats`} />
                        )}
                        {event.profiles?.full_name && (
                            <InfoRow icon={<Users size={20} className="text-sky-500" />} label="Organizer" value={event.profiles.full_name} />
                        )}
                    </div>

                    {/* --- Attendee List Section for Organizer --- */}
                    {isOrganizer && (
                        <div className="pt-10 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Attendees</h2>
                                    <p className="text-sm text-slate-500">Manage participant check-ins and bookings</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {attendees.some(t => t.status === 'active') && (
                                        <button
                                            onClick={handleCheckInAll}
                                            disabled={batchCheckingIn}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {batchCheckingIn ? 'Processing...' : 'Check In All'}
                                        </button>
                                    )}
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-sky-600">{attendees.length}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Registered</p>
                                    </div>
                                </div>
                            </div>

                            {loadingAttendees ? (
                                <div className="py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                                    <Loader2 className="animate-spin text-sky-500 mb-3" />
                                    <p className="text-slate-500 text-sm font-medium">Fetching guest list...</p>
                                </div>
                            ) : attendees.length === 0 ? (
                                <div className="py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center px-6">
                                    <Users className="mx-auto text-slate-300 mb-4" size={40} />
                                    <p className="text-slate-700 font-bold text-lg">No attendees yet</p>
                                    <p className="text-slate-500 text-sm mt-1">Attendees will appear here once they book tickets.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {attendees.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-black border border-sky-100 group-hover:scale-110 transition-transform overflow-hidden">
                                                    {t.profiles?.avatar_url ? (
                                                        <img src={t.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        t.profiles?.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                                                        {t.profiles?.full_name || `User #${t.user_id.slice(0, 4)}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-4">
                                                        <span>Booked {format(parseISO(t.booked_at), 'MMM d, p')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    t.status === 'used' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {t.status}
                                                </div>

                                                {t.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCheckIn(t.id)}
                                                        className="px-4 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-600 active:scale-95 transition-all shadow-md"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Booking sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 sticky top-24">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Ticket size={24} className="text-sky-600" /> Ticket Status
                        </h2>

                        {isOrganizer ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-sky-800">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
                                    <p className="text-2xl font-black">{attendees.length} / {event.capacity || '∞'}</p>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    As the organizer, you can see all attendees and check them in using the list below.
                                </p>
                            </div>
                        ) : (
                            <>
                                {hasTicket ? (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold mb-6 border border-emerald-100">
                                        <CheckCircle2 size={24} />
                                        <div>
                                            <p className="leading-tight">Booking Confirmed</p>
                                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-0.5">
                                                {tickets.find(t => t.event_id === id)?.status === 'used' ? 'Ticket scavenged' : 'See you there!'}
                                            </p>
                                        </div>
                                    </div>
                                ) : isExpired ? (
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 text-slate-500 rounded-2xl text-sm font-bold mb-6 border border-slate-100">
                                        <AlertCircle size={24} />
                                        <div>
                                            <p className="leading-tight">Event Concluded</p>
                                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-0.5">Booking is closed</p>
                                        </div>
                                    </div>
                                ) : null}

                                <button
                                    onClick={handleBook}
                                    disabled={hasTicket || isExpired || booking}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-lg shadow-xl shadow-sky-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                    style={{ backgroundColor: '#0284c7' }}
                                >
                                    {booking
                                        ? <Loader2 size={24} className="animate-spin" />
                                        : <Ticket size={24} />}
                                    {hasTicket
                                        ? (tickets.find(t => t.event_id === id)?.status === 'used' ? 'Already Attended' : 'Already Booked')
                                        : (event.available_tickets !== undefined && event.available_tickets <= 0 ? 'Sold Out' : 'Get My Ticket')}
                                </button>

                                {event.available_tickets !== undefined && !hasTicket && !isExpired && (
                                    <p className="text-center text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">
                                        {event.available_tickets <= 0
                                            ? 'No tickets left'
                                            : `${event.available_tickets} spots available`}
                                    </p>
                                )}

                                {!isAuthenticated && (
                                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-center">
                                        <p className="text-slate-500 text-xs font-medium">Please <button onClick={() => navigate('/login')} className="text-sky-600 font-bold hover:underline">sign in</button> to book your spot.</p>
                                    </div>
                                )}

                                {hasTicket && (
                                    <button
                                        onClick={() => navigate('/my-tickets')}
                                        className="w-full mt-4 py-3 rounded-2xl border border-sky-100 text-sky-700 font-black text-sm hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        View Ticket Details <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-slate-800 font-medium">{value}</p>
        </div>
    </div>
);

export default EventDetail;
