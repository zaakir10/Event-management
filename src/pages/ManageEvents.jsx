import { useEffect, useState } from 'react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useAlert } from '../context/AlertContext';
import { Plus, X, Loader2, Calendar, Globe, Lock, Pencil, Trash2, Users, Ticket as TicketIcon } from 'lucide-react';
import EventCard from '../components/EventCard';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Sport', 'Meetup', 'Other'];

const emptyForm = {
    title: '', description: '', event_date: '', location: '',
    capacity: '', category: '', cover_image: '',
};

const ManageEvents = () => {
    const { events, fetchMyEvents, createEvent, updateEvent, deleteEvent, loading } = useEvents();
    const { fetchEventTickets, markTicketUsed, markAllTicketsUsed } = useTickets();
    const { user } = useAuth();
    const { confirm } = useAlert();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    // Attendees state
    const [showAttendees, setShowAttendees] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [batchCheckingIn, setBatchCheckingIn] = useState(false);

    useEffect(() => { fetchMyEvents(); }, [fetchMyEvents]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
    const openEdit = (event) => {
        setForm({
            title: event.title || '',
            description: event.description || '',
            event_date: event.event_date ? event.event_date.slice(0, 16) : '',
            location: event.location || '',
            capacity: event.capacity || '',
            category: event.category || '',
            cover_image: event.cover_image || '',
        });
        setEditingId(event.id);
        setShowForm(true);
    };

    const handleViewAttendees = async (event) => {
        setCurrentEvent(event);
        setShowAttendees(true);
        setLoadingAttendees(true);
        try {
            const data = await fetchEventTickets(event.id);
            setAttendees(data);
        } catch (err) {
            toast.error(err.message || "Failed to load attendees");
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleCheckIn = async (ticketId) => {
        try {
            await markTicketUsed(ticketId);
            setAttendees(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'used' } : t));
        } catch (err) { }
    };

    const handleCheckInAll = async () => {
        if (!currentEvent) return;
        const confirmed = await confirm(
            'Check In All?',
            `Are you sure you want to mark all active attendees for "${currentEvent.title}" as checked in?`,
            'info'
        );
        if (!confirmed) return;

        setBatchCheckingIn(true);
        try {
            await markAllTicketsUsed(currentEvent.id);
            setAttendees(prev => prev.map(t => ({ ...t, status: 'used' })));
        } catch (err) { }
        finally { setBatchCheckingIn(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');

        setSubmitting(true);
        try {
            // Safely handle capacity (could be number from DB or string from input)
            const capacityStr = form.capacity !== null && form.capacity !== undefined ? String(form.capacity).trim() : '';
            const capacityVal = capacityStr !== '' ? Number(capacityStr) : null;

            const payload = {
                ...form,
                capacity: capacityVal,
                event_date: form.event_date || null
            };

            if (editingId) {
                await updateEvent(editingId, payload);
            } else {
                await createEvent(payload);
            }
            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (err) {
            console.error("Submission Error:", err);
            toast.error(err.message || "Failed to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublish = async (event) => {
        const newStatus = event.status === 'published' ? 'draft' : 'published';
        await updateEvent(event.id, { status: newStatus });
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Delete Event?',
            'This action is permanent and will delete all associated tickets/bookings.',
            'danger'
        );
        if (!confirmed) return;

        try {
            await deleteEvent(id);
        } catch (err) { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Events</h1>
                    <p className="text-slate-500 mt-1">{events.length} event{events.length !== 1 ? 's' : ''} created by you</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold shadow-md"
                    style={{ backgroundColor: '#0284c7' }}
                >
                    <Plus size={18} /> Create Event
                </button>
            </div>

            {/* ── Event Form Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-800">
                                {editingId ? '✏️ Edit Event' : '✨ Create New Event'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Event Title *</label>
                                <input name="title" required value={form.title} onChange={handleChange}
                                    placeholder="e.g. React Conference 2026"
                                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange}
                                    rows="3" placeholder="What is this event about?"
                                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50 resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date & Time *</label>
                                    <input name="event_date" type="datetime-local" required value={form.event_date} onChange={handleChange}
                                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                    <input name="location" value={form.location} onChange={handleChange}
                                        placeholder="City or Online"
                                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Capacity</label>
                                    <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange}
                                        placeholder="Max attendees"
                                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <select name="category" value={form.category} onChange={handleChange}
                                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50">
                                        <option value="">No category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cover Image URL</label>
                                <input name="cover_image" value={form.cover_image} onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 outline-none text-slate-900 bg-slate-50/50" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex items-center gap-2 px-10 py-4 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 active:scale-95 transition-all"
                                    style={{ backgroundColor: '#0284c7' }}>
                                    {submitting && <Loader2 size={20} className="animate-spin" />}
                                    {editingId ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Attendees Modal ── */}
            {showAttendees && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight">Event Attendees</h2>
                                <p className="text-slate-500 font-medium line-clamp-1">{currentEvent?.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {attendees.some(a => a.status === 'active') && (
                                    <button
                                        onClick={handleCheckInAll}
                                        disabled={batchCheckingIn}
                                        className="h-10 px-4 flex items-center gap-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                                    >
                                        {batchCheckingIn ? <Loader2 size={14} className="animate-spin" /> : 'Check In All'}
                                    </button>
                                )}
                                <button onClick={() => setShowAttendees(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingAttendees ? (
                                <div className="flex flex-col items-center py-20">
                                    <Loader2 size={40} className="animate-spin text-sky-500 mb-4" />
                                    <p className="text-slate-500 font-medium">Crunching attendee list...</p>
                                </div>
                            ) : attendees.length === 0 ? (
                                <div className="text-center py-20 px-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Users size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No bookings yet</h3>
                                    <p className="text-slate-400 text-sm mt-1">When someone books a ticket, they'll appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attendees.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold overflow-hidden">
                                                    {t.profiles?.avatar_url ? (
                                                        <img src={t.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        t.profiles?.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">
                                                        {t.profiles?.full_name || `User #${t.user_id.slice(0, 4)}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        Booked {format(parseISO(t.booked_at), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    t.status === 'used' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {t.status}
                                                </div>
                                                {t.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCheckIn(t.id)}
                                                        className="px-3 py-1.5 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-colors"
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
                    </div>
                </div>
            )}

            {/* ── Events grid ── */}
            {loading ? (
                <div className="flex flex-col items-center py-24">
                    <Loader2 size={40} className="animate-spin mb-3 text-sky-500" />
                    <p className="text-slate-500 font-medium">Loading your showcase...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                    <Calendar size={48} className="text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-700">Ready to organize?</h3>
                    <p className="text-slate-400 text-lg mt-2 max-w-xs mx-auto mb-8">Create your first event to start accepting ticket bookings!</p>
                    <button onClick={openCreate} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl">
                        Start Growing Today
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event.id} className="relative">
                            <EventCard event={event} showStatus onEdit={openEdit} onDelete={handleDelete} />

                            {/* Organizer Exclusive Actions Overlay Buttons */}
                            <div className="absolute top-[164px] right-6 flex items-center gap-2">
                                <button
                                    onClick={() => handleViewAttendees(event)}
                                    className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 text-sky-600 hover:scale-110 transition-all hover:bg-white"
                                    title="View Attendees"
                                >
                                    <Users size={18} />
                                </button>
                                <button
                                    onClick={() => handlePublish(event)}
                                    className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg border border-white/20 backdrop-blur-md ${event.status === 'published'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-700 text-white'
                                        }`}
                                >
                                    {event.status === 'published'
                                        ? <><Globe size={14} /> LIVE</>
                                        : <><Lock size={14} /> DRAFT</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageEvents;
