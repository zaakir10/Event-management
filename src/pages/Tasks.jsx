import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import {
    Plus, Search, SlidersHorizontal, AlertCircle, Loader2,
    ArrowUp, ArrowRight, ArrowDown, X
} from 'lucide-react';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Finance'];
const PRIORITIES = ['high', 'medium', 'low'];

const Tasks = () => {
    const {
        tasks, filteredTasks, fetchTasks, addTask, updateTask, deleteTask,
        loading, error,
        search, setSearch,
        filterStatus, setFilterStatus,
        filterPriority, setFilterPriority,
        filterCategory, setFilterCategory,
        sort, setSort,
    } = useTasks();

    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', priority: 'medium', category: '', due_date: ''
    });

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSubmitting(true);
        try {
            await addTask({
                title: form.title.trim(),
                description: form.description.trim() || null,
                priority: form.priority,
                category: form.category || null,
                due_date: form.due_date || null,
            });
            setForm({ title: '', description: '', priority: 'medium', category: '', due_date: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const priorityIcon = { high: <ArrowUp size={14} />, medium: <ArrowRight size={14} />, low: <ArrowDown size={14} /> };

    const activeFilterCount = [
        filterStatus !== 'all', filterPriority !== 'all', filterCategory !== 'all', sort !== 'newest'
    ].filter(Boolean).length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Tasks</h1>
                    <p className="text-slate-500 mt-1">
                        {tasks.length} total · {tasks.filter(t => t.status === 'completed').length} completed
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-md"
                    style={{ backgroundColor: '#0284c7' }}
                >
                    {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Task</>}
                </button>
            </div>

            {/* ── Add Task Form ── */}
            {showForm && (
                <div className="mb-8 bg-white p-6 rounded-2xl border-2 border-sky-100 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">New Task</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                                <input
                                    name="title" type="text" required value={form.title} onChange={handleChange}
                                    placeholder="What needs to be done?"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="Add more details..."
                                    rows="2"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 resize-none"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                                <select
                                    name="priority" value={form.priority} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 bg-white"
                                >
                                    <option value="high">🔴 High</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                <select
                                    name="category" value={form.category} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 bg-white"
                                >
                                    <option value="">No category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                                <input
                                    name="due_date" type="date" value={form.due_date} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit" disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold disabled:opacity-50"
                                style={{ backgroundColor: '#0284c7' }}
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Search + Filter Bar ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium text-sm transition-all ${activeFilterCount > 0
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 text-xs flex items-center justify-center rounded-full bg-sky-600 text-white font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Expanded Filters ── */}
            {showFilters && (
                <div className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="all">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="all">All</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Sort By</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="due_date">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* ── Task List / Empty State ── */}
            {loading && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={40} className="animate-spin text-sky-600 mb-3" />
                    <p className="text-slate-500">Loading tasks...</p>
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No tasks found</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                        {search || activeFilterCount > 0
                            ? 'Try adjusting your search or filters.'
                            : "You haven't created any tasks yet. Click 'Add Task' to start!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Tasks;
