import { Trash2, CheckCircle, Clock, AlertTriangle, ArrowUp, ArrowRight, ArrowDown, Tag, Calendar } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO, format } from 'date-fns';

// ── Priority config ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
    high: { label: 'High', icon: <ArrowUp size={12} />, classes: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Medium', icon: <ArrowRight size={12} />, classes: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: 'Low', icon: <ArrowDown size={12} />, classes: 'bg-slate-100 text-slate-600 border-slate-200' },
};

// ── Category colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
    Work: 'bg-blue-100 text-blue-700',
    Study: 'bg-violet-100 text-violet-700',
    Personal: 'bg-emerald-100 text-emerald-700',
    Health: 'bg-rose-100 text-rose-700',
    Finance: 'bg-yellow-100 text-yellow-700',
};

const TaskCard = ({ task, onUpdate, onDelete }) => {
    const isCompleted = task.status === 'completed';
    const priority = PRIORITY_CONFIG[task.priority] || null;
    const isOverdue = task.due_date && !isCompleted && isPast(parseISO(task.due_date));

    const toggleStatus = () => {
        onUpdate(task.id, { status: isCompleted ? 'pending' : 'completed' });
    };

    return (
        <div
            className={`p-5 rounded-2xl border transition-all duration-200 group ${isOverdue
                    ? 'bg-red-50/60 border-red-200'
                    : isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-primary-400 hover:shadow-md'
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                {/* ── Content ── */}
                <div className="flex-1 min-w-0">

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Status badge */}
                        {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle size={10} /> Done
                            </span>
                        ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                                <AlertTriangle size={10} /> Overdue
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                <Clock size={10} /> Pending
                            </span>
                        )}

                        {/* Priority badge */}
                        {priority && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priority.classes}`}>
                                {priority.icon} {priority.label}
                            </span>
                        )}

                        {/* Category chip */}
                        {task.category && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${CATEGORY_COLORS[task.category] || 'bg-slate-100 text-slate-600'}`}>
                                <Tag size={10} /> {task.category}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold text-base leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}>
                        {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                            {task.description}
                        </p>
                    )}

                    {/* Due date */}
                    {task.due_date && (
                        <div className={`flex items-center gap-1.5 mt-3 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'
                            }`}>
                            <Calendar size={12} />
                            {isOverdue
                                ? `Overdue by ${formatDistanceToNow(parseISO(task.due_date))}`
                                : `Due ${format(parseISO(task.due_date), 'MMM d, yyyy')}`}
                        </div>
                    )}
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                        onClick={toggleStatus}
                        title={isCompleted ? 'Mark pending' : 'Mark complete'}
                        className={`p-2 rounded-xl transition-all ${isCompleted
                                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        title="Delete"
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </div>
        </div>
    );
};

export default TaskCard;
