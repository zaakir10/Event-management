// ── Task constants ────────────────────────────────────────────────────────────

export const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Finance'];

export const PRIORITIES = [
    { value: 'high', label: '🔴 High', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'medium', label: '🟡 Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'low', label: '🟢 Low', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
];

export const CATEGORY_COLORS = {
    Work: 'bg-blue-100 text-blue-700',
    Study: 'bg-violet-100 text-violet-700',
    Personal: 'bg-emerald-100 text-emerald-700',
    Health: 'bg-rose-100 text-rose-700',
    Finance: 'bg-yellow-100 text-yellow-700',
};
