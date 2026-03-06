import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, Eye, Pencil, Trash2, Ticket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useState } from 'react';

const STATUS_STYLES = {
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
};

const EventCard = ({ event, showStatus = false, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();
    const { tickets, bookTicket } = useTickets();
    const [booking, setBooking] = useState(false);

    const hasTicket = tickets.some(t => t.event_id === event.id);

    const dateStr = event.event_date
        ? format(parseISO(event.event_date), 'EEE, MMM d · h:mm a')
        : 'Date TBD';

    const isSoldOut = event.available_tickets !== undefined && event.available_tickets <= 0;

    const handleQuickBook = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (booking) return;
        setBooking(true);
        try {
            await bookTicket(event.id);
        } catch (err) { }
        finally { setBooking(false); }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-sky-400 transition-all duration-300 group">
            {/* Cover image / placeholder */}
            <div className="h-48 bg-gradient-to-br from-sky-400 to-blue-600 relative overflow-hidden">
                {event.cover_image ? (
                    <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Calendar size={64} className="text-white group-hover:scale-110 transition-transform duration-500" />
                    </div>
                )}

                {/* Status Badges - Glassmorphism style */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {showStatus && (
                        <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${STATUS_STYLES[event.status] || STATUS_STYLES.draft}`}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                            {event.status}
                        </span>
                    )}
                    {isSoldOut && (
                        <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse">
                            Sold Out
                        </span>
                    )}
                </div>

                {event.category && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center gap-1.5 shadow-sm">
                        <Tag size={12} className="text-sky-600" /> {event.category}
                    </span>
                )}
            </div>

            <div className="p-6">
                <h3 className="font-extrabold text-xl text-slate-900 leading-tight mb-3 group-hover:text-sky-700 transition-colors line-clamp-2 min-h-[52px]">
                    {event.title}
                </h3>

                {event.description && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                            <Calendar size={14} />
                        </div>
                        {dateStr}
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <MapPin size={14} />
                            </div>
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                    {event.capacity && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                <Users size={14} />
                            </div>
                            <span className="text-xs">
                                {event.available_tickets ?? event.capacity} / {event.capacity} Available
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/events/${event.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-md active:scale-95"
                            style={{ backgroundColor: '#0284c7', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
                        >
                            <Eye size={16} /> Details
                        </Link>

                        {isAuthenticated && !showStatus && !isSoldOut && !hasTicket && (
                            <button
                                onClick={handleQuickBook}
                                disabled={booking}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-emerald-500 text-white transition-all shadow-md active:scale-95 hover:bg-emerald-600 disabled:opacity-50"
                                style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                            >
                                {booking ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Ticket size={16} />}
                                Book Now
                            </button>
                        )}

                        {isAuthenticated && hasTicket && !showStatus && (
                            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <Ticket size={16} /> Booked
                            </div>
                        )}
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="flex gap-2 w-full">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(event)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all border border-slate-100"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(event.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
