import { useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, Loader2, AlertCircle } from 'lucide-react';
import TicketCard from '../components/TicketCard';

const MyTickets = () => {
    const { tickets, fetchMyTickets, cancelTicket, loading, error } = useTickets();

    useEffect(() => { fetchMyTickets(); }, [fetchMyTickets]);

    const active = tickets.filter(t => t.status === 'active');
    const past = tickets.filter(t => t.status !== 'active');

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Ticket style={{ color: '#0284c7' }} /> My Tickets
                </h1>
                <p className="text-slate-500 mt-1">All your event bookings in one place</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={40} className="animate-spin mb-3" style={{ color: '#0284c7' }} />
                    <p className="text-slate-500">Loading tickets...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Ticket size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No tickets yet</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Browse events and book your first ticket!
                    </p>
                    <a
                        href="/events"
                        className="inline-block mt-4 px-5 py-2.5 text-white rounded-xl text-sm font-bold"
                        style={{ backgroundColor: '#0284c7' }}
                    >
                        Browse Events
                    </a>
                </div>
            ) : (
                <>
                    {/* Active tickets */}
                    {active.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                                Active Tickets ({active.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-5">
                                {active.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} onCancel={cancelTicket} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Past / cancelled tickets */}
                    {past.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                                Past & Cancelled ({past.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-5">
                                {past.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default MyTickets;
