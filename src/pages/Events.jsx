import { useEffect, useState } from 'react';
import { useEvents } from '../context/EventContext';
import { useTickets } from '../context/TicketContext';
import { Search, SlidersHorizontal, Calendar, X, Loader2 } from 'lucide-react';
import EventCard from '../components/EventCard';

const Events = () => {
    const {
        filteredEvents, fetchPublicEvents, loading,
        search, setSearch, filterStatus, setFilterStatus,
    } = useEvents();

    const [showFilters, setShowFilters] = useState(false);

    const { fetchMyTickets } = useTickets();

    useEffect(() => {
        fetchPublicEvents();
        fetchMyTickets();
    }, [fetchPublicEvents, fetchMyTickets]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Browse Events</h1>
                <p className="text-slate-500 mt-1">Discover and book tickets for upcoming events</p>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search events by name, location..."
                        className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': '#0284c7' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium"
                >
                    <SlidersHorizontal size={16} /> Filters
                </button>
            </div>

            {showFilters && (
                <div className="mb-8 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Filter by Category</h3>
                        {filterStatus !== 'all' && (
                            <button
                                onClick={() => setFilterStatus('all')}
                                className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                            >
                                Reset Category
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {['all', 'Conference', 'Workshop', 'Concert', 'Sport', 'Meetup', 'Other'].map(cat => (
                            <button
                                key={cat}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all duration-200 border ${filterStatus === cat
                                    ? 'border-sky-500 text-white shadow-lg shadow-sky-200'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-sky-200 hover:text-sky-600'
                                    }`}
                                style={filterStatus === cat ? { backgroundColor: '#0284c7' } : {}}
                                onClick={() => setFilterStatus(cat)}
                            >
                                {cat === 'all' ? 'All Events' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative">
                        <Loader2 size={48} className="animate-spin text-sky-500" />
                        <div className="absolute inset-0 blur-xl bg-sky-400/20 animate-pulse rounded-full" />
                    </div>
                    <p className="text-slate-500 font-medium mt-6">Searching the best events...</p>
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No matching events</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        We couldn't find any events matching your current search or filters.
                    </p>
                    <button
                        onClick={() => { setSearch(''); setFilterStatus('all'); }}
                        className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Events;
