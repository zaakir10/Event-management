import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useEvents } from '../context/EventContext';
import { useTickets } from '../context/TicketContext';
import { Link } from 'react-router-dom';
import {
    ListTodo, CheckSquare, Clock, AlertTriangle,
    PlusCircle, User, TrendingUp, Calendar, Ticket, MapPin
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, subDays, isPast, parseISO } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const STATUS_COLORS = ['#0284c7', '#94a3b8'];

const Dashboard = () => {
    const { user } = useAuth();
    const { tasks, fetchTasks } = useTasks();
    const { events, fetchMyEvents } = useEvents();
    const { tickets, fetchMyTickets } = useTickets();

    useEffect(() => {
        fetchTasks();
        fetchMyEvents();
        fetchMyTickets();
    }, [fetchTasks, fetchMyEvents, fetchMyTickets]);

    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const activeTickets = tickets.filter(t => t.status === 'active').length;
    const myEvents = events.length;

    // ── Chart: Tasks created per day (last 7 days) ──────────────────────────
    const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const label = format(d, 'EEE');
        const count = tasks.filter(t =>
            format(new Date(t.created_at), 'd MMM') === format(d, 'd MMM')
        ).length;
        return { label, count };
    });

    // ── Chart: Priority breakdown ─────────────────────────────────────────────
    const priorityData = ['high', 'medium', 'low'].map(p => ({
        name: p.charAt(0).toUpperCase() + p.slice(1),
        value: tasks.filter(t => t.priority === p).length,
        fill: PRIORITY_COLORS[p],
    })).filter(d => d.value > 0);

    // ── Chart: Status pie ─────────────────────────────────────────────────────
    const statusData = [
        { name: 'Completed', value: completed },
        { name: 'Pending', value: pending },
    ].filter(d => d.value > 0);

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {/* ── Welcome header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Good {getGreeting()}, {firstName}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1 text-lg">Your event management command center.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/manage-events"
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 active:scale-95"
                    >
                        <PlusCircle size={20} /> Create Event
                    </Link>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<ListTodo />} label="Pending Tasks" value={tasks.filter(t => t.status === 'pending').length} color="bg-sky-50 text-sky-600" />
                <StatCard icon={<Calendar />} label="Events Organized" value={myEvents} color="bg-indigo-50 text-indigo-600" />
                <StatCard icon={<Ticket />} label="Active Tickets" value={activeTickets} color="bg-rose-50 text-rose-600" />
                <StatCard icon={<CheckSquare />} label="Task History" value={tasks.length} color="bg-emerald-50 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Left Column: Events & Tickets ── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Events Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={20} className="text-indigo-600" /> My Recent Events
                            </h2>
                            <Link to="/manage-events" className="text-sm font-bold text-sky-600 hover:text-sky-700">View All</Link>
                        </div>
                        <div className="p-2">
                            {events.length > 0 ? (
                                <div className="space-y-1">
                                    {events.slice(0, 3).map(event => (
                                        <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600 font-bold border border-indigo-100 flex-shrink-0">
                                                <span className="text-[10px] uppercase leading-none">{event.event_date ? format(parseISO(event.event_date), 'MMM') : 'TBD'}</span>
                                                <span className="text-lg leading-none">{event.event_date ? format(parseISO(event.event_date), 'd') : '?'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 truncate group-hover:text-sky-600 transition-colors">{event.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {event.location || 'Online'}</span>
                                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${event.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link to={`/events/${event.id}`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all">
                                                <TrendingUp size={18} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No events organized yet.</p>
                                    <Link to="/manage-events" className="text-sky-600 text-sm font-bold mt-2 inline-block">Start your first event</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Tickets Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Ticket size={20} className="text-rose-600" /> My Recent Tickets
                            </h2>
                            <Link to="/my-tickets" className="text-sm font-bold text-sky-600 hover:text-sky-700">View All</Link>
                        </div>
                        <div className="p-2">
                            {tickets.length > 0 ? (
                                <div className="space-y-1">
                                    {tickets.slice(0, 3).map(ticket => (
                                        <div key={ticket.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 flex-shrink-0">
                                                <Ticket size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 truncate">{ticket.events?.title || 'Unknown Event'}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {ticket.events?.event_date ? format(parseISO(ticket.events.event_date), 'MMM d, p') : 'TBD'}</span>
                                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${ticket.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors duration-300">
                                                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-sm overflow-hidden p-0.5">
                                                    <QRCodeSVG
                                                        value={ticket.qr_code || `TK-${ticket.id}`}
                                                        size={30}
                                                        level="L"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Ticket size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">You haven't booked any tickets yet.</p>
                                    <Link to="/events" className="text-sky-600 text-sm font-bold mt-2 inline-block">Browse upcoming events</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Activity & Quick Actions ── */}
                <div className="space-y-8">
                    {/* Activity Chart */}
                    {tasks.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-sky-600" /> Weekly Task Activity
                            </h2>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={last7}>
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ border: 'none', borderRadius: 12, fontSize: 11, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200">
                        <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickAction
                                to="/tasks"
                                icon={<ListTodo className="text-sky-400" size={20} />}
                                title="My Tasks"
                                dark
                            />
                            <QuickAction
                                to="/manage-events"
                                icon={<Calendar className="text-indigo-400" size={20} />}
                                title="Organize Events"
                                dark
                            />
                            <QuickAction
                                to="/profile"
                                icon={<User className="text-violet-400" size={20} />}
                                title="Account Settings"
                                dark
                            />
                        </div>
                    </div>

                    {/* Task Breakdown (Pie) */}
                    {tasks.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Task Priority</h2>
                            <div className="flex justify-center">
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={priorityData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={5}>
                                            {priorityData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                {priorityData.map(d => (
                                    <div key={d.name} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
    </div>
);

const QuickAction = ({ to, icon, title, dark }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all active:scale-[0.98] border ${dark
            ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300 hover:text-white'
            : 'bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 text-slate-600 hover:text-sky-700'
            }`}
    >
        <div className={`p-2 rounded-xl ${dark ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}>
            {icon}
        </div>
        <span className="font-bold text-sm">{title}</span>
    </Link>
);

export default Dashboard;
