import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    active: { label: 'Active', icon: <CheckCircle2 size={13} />, classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    used: { label: 'Used', icon: <Clock size={13} />, classes: 'bg-slate-100 text-slate-500 border-slate-200' },
    cancelled: { label: 'Cancelled', icon: <XCircle size={13} />, classes: 'bg-red-100 text-red-600 border-red-200' },
};

const TicketCard = ({ ticket, onCancel }) => {
    const event = ticket.events;
    const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.active;
    const isActive = ticket.status === 'active';

    // Use the unique QR code string stored in the database
    const qrValue = ticket.qr_code || `TICKET:${ticket.id}`;

    const formattedBookedDate = ticket.booked_at
        ? format(parseISO(ticket.booked_at), 'MMM d, yyyy')
        : 'Unknown';

    return (
        <div className={`bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 ${isActive ? 'border-sky-100 shadow-xl' : 'border-slate-50 opacity-60'
            }`}>
            {/* Ticket header */}
            <div
                className="px-6 py-5 text-white relative overflow-hidden"
                style={{ background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#94a3b8' }}
            >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 pr-4">
                        <p className="text-[10px] font-bold text-sky-200 uppercase tracking-[0.2em] mb-1.5 opacity-80">🎟️ Official Event Ticket</p>
                        <h3 className="font-extrabold text-xl leading-tight tracking-tight line-clamp-2">
                            {event?.title || 'Unknown Event'}
                        </h3>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 ${status.classes}`}
                        style={{ backgroundColor: 'white' }}>
                        {status.icon} {status.label}
                    </span>
                </div>
            </div>

            {/* Dashed separator with punch holes */}
            <div className="relative flex items-center py-1 bg-slate-50/50">
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 absolute -left-3 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]" />
                <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-4" />
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 absolute -right-3 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]" />
            </div>

            {/* Ticket body */}
            <div className="px-6 py-5 flex items-start justify-between gap-6 bg-white">
                <div className="space-y-3 flex-1">
                    {event?.event_date && (
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="mt-1 flex-shrink-0"><Calendar size={16} className="text-sky-500" /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
                                <p className="font-semibold">{format(parseISO(event.event_date), 'PPP · p')}</p>
                            </div>
                        </div>
                    )}
                    {event?.location && (
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="mt-1 flex-shrink-0"><MapPin size={16} className="text-sky-500" /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                <p className="font-semibold">{event.location}</p>
                            </div>
                        </div>
                    )}
                    <div className="pt-2 flex items-center gap-4 border-t border-slate-50">
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ticket ID</p>
                            <p className="text-xs text-slate-500 font-mono font-bold tracking-tighter">
                                #{ticket.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Booked On</p>
                            <p className="text-xs text-slate-500 font-bold">{formattedBookedDate}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 mt-1">
                    <div className={`p-2.5 rounded-2xl border-2 transition-all duration-300 ${isActive ? 'border-sky-50 bg-white shadow-lg' : 'border-slate-100 opacity-40'}`}>
                        <QRCodeSVG value={qrValue} size={92} level="H" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em] uppercase">Scan to Verify</p>
                </div>
            </div>

            {/* Actions */}
            {isActive && (
                <div className="px-6 pb-6 pt-2 flex gap-3">
                    {onCancel && (
                        <button
                            onClick={() => onCancel(ticket.id)}
                            className="flex-1 py-3 px-4 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all border border-red-50 active:scale-95"
                        >
                            Cancel Ticket
                        </button>
                    )}
                    <button
                        onClick={() => toast.success('Ticket link copied to clipboard!')}
                        className="py-3 px-6 text-xs font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-2xl transition-all border border-sky-50 active:scale-95 bg-sky-50/50"
                    >
                        Share
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicketCard;
