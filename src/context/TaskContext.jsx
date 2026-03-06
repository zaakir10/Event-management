import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { taskReducer } from './reducers';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const initialState = {
    tasks: [],
    loading: false,
    error: null,
    // ── Filters & Search ──
    search: '',
    filterStatus: 'all',
    filterPriority: 'all',
    filterCategory: 'all',
    sort: 'newest',
};

export const TaskProvider = ({ children }) => {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const { user } = useAuth();

    // ── Fetch all tasks for current user ──────────────────────────────────────
    const fetchTasks = useCallback(async () => {
        if (!user) return;
        dispatch({ type: 'SET_LOADING', payload: true });

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            toast.error('Failed to load tasks.');
        } else {
            dispatch({ type: 'SET_TASKS', payload: data });
        }
    }, [user]);

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        dispatch({ type: 'ADD_TASK', payload: payload.new });
                    } else if (payload.eventType === 'UPDATE') {
                        dispatch({ type: 'UPDATE_TASK', payload: payload.new });
                    } else if (payload.eventType === 'DELETE') {
                        dispatch({ type: 'DELETE_TASK', payload: payload.old.id });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const addTask = async (taskData) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...taskData, user_id: user.id, status: 'pending' }])
            .select();

        if (error) {
            toast.error('Failed to add task.');
            throw error;
        }
        // Realtime will dispatch ADD_TASK, but insert manually for non-realtime envs
        dispatch({ type: 'ADD_TASK', payload: data[0] });
        toast.success('Task added!');
    };

    const updateTask = async (id, updates) => {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            toast.error('Failed to update task.');
            throw error;
        }
        dispatch({ type: 'UPDATE_TASK', payload: data[0] });
        toast.success('Task updated!');
    };

    const deleteTask = async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete task.');
            throw error;
        }
        dispatch({ type: 'DELETE_TASK', payload: id });
        toast.success('Task deleted.');
    };

    // ── Derived filtered + sorted tasks ──────────────────────────────────────
    const getFilteredTasks = () => {
        let result = [...state.tasks];

        // Search
        if (state.search.trim()) {
            const q = state.search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    (t.description || '').toLowerCase().includes(q)
            );
        }

        // Status filter
        if (state.filterStatus !== 'all') {
            result = result.filter((t) => t.status === state.filterStatus);
        }

        // Priority filter
        if (state.filterPriority !== 'all') {
            result = result.filter((t) => t.priority === state.filterPriority);
        }

        // Category filter
        if (state.filterCategory !== 'all') {
            result = result.filter((t) => t.category === state.filterCategory);
        }

        // Sort
        if (state.sort === 'newest') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (state.sort === 'oldest') {
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (state.sort === 'due_date') {
            result.sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            });
        } else if (state.sort === 'priority') {
            const order = { high: 0, medium: 1, low: 2 };
            result.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
        }

        return result;
    };

    return (
        <TaskContext.Provider
            value={{
                ...state,
                fetchTasks,
                addTask,
                updateTask,
                deleteTask,
                filteredTasks: getFilteredTasks(),
                setSearch: (v) => dispatch({ type: 'SET_SEARCH', payload: v }),
                setFilterStatus: (v) => dispatch({ type: 'SET_FILTER_STATUS', payload: v }),
                setFilterPriority: (v) => dispatch({ type: 'SET_FILTER_PRIORITY', payload: v }),
                setFilterCategory: (v) => dispatch({ type: 'SET_FILTER_CATEGORY', payload: v }),
                setSort: (v) => dispatch({ type: 'SET_SORT', payload: v }),
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};
