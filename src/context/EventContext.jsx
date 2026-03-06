import { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { eventReducer } from './reducers';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const EventContext = createContext();

const initialState = {
    events: [],
    loading: false,
    error: null,
    search: '',
    filterStatus: 'all',
};

export const EventProvider = ({ children }) => {
    const [state, dispatch] = useReducer(eventReducer, initialState);
    const { user } = useAuth();

    // ── Fetch ALL published events (public browsing) ──────────────────────────
    const fetchPublicEvents = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Try with join
        const { data, error } = await supabase
            .from('events')
            .select('*, profiles!organizer_id(full_name)')
            .eq('status', 'published')
            .order('event_date', { ascending: true });

        if (!error && data) {
            dispatch({ type: 'SET_EVENTS', payload: data });
        } else {
            console.warn("fetchPublicEvents with join failed, trying fallback...", error);
            // Fallback: without join
            const { data: basicData, error: basicError } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'published')
                .order('event_date', { ascending: true });

            if (basicError) {
                console.error("fetchPublicEvents Complete Failure:", basicError);
                dispatch({ type: 'SET_ERROR', payload: basicError.message });
            } else {
                dispatch({ type: 'SET_EVENTS', payload: basicData });
            }
        }
    }, []);

    // ── Fetch events the current user is organizing ───────────────────────────
    const fetchMyEvents = useCallback(async () => {
        if (!user) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('organizer_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } else {
            dispatch({ type: 'SET_EVENTS', payload: data });
        }
    }, [user]);

    // ── Fetch single event by ID ──────────────────────────────────────────────
    const fetchEventById = async (id) => {
        // First try with the join
        const { data, error } = await supabase
            .from('events')
            .select('*, profiles!organizer_id(full_name)')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) {
            // Fallback: try without the join in case profiles RLS is strict
            const { data: basicData, error: basicError } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (basicError || !basicData) {
                console.error("fetchEventById Complete Failure:", basicError || 'No data');
                throw new Error('Event not found');
            }
            return basicData;
        }
        return data;
    };

    // ── Create event ──────────────────────────────────────────────────────────
    const createEvent = async (eventData) => {
        const { data, error } = await supabase
            .from('events')
            .insert([{
                ...eventData,
                organizer_id: user.id,
                status: 'draft',
                available_tickets: eventData.capacity // Set available tickets to capacity initially
            }])
            .select();
        if (error) { toast.error('Failed to create event.'); throw error; }
        dispatch({ type: 'ADD_EVENT', payload: data[0] });
        toast.success('Event created!');
        return data[0];
    };

    // ── Update event ──────────────────────────────────────────────────────────
    const updateEvent = async (id, updates) => {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) { toast.error('Failed to update event.'); throw error; }
        dispatch({ type: 'UPDATE_EVENT', payload: data[0] });
        toast.success('Event updated!');
    };

    // ── Delete event ──────────────────────────────────────────────────────────
    const deleteEvent = async (id) => {
        try {
            // 1. Manually delete associated tickets first (in case CASCADE is not set)
            const { error: ticketErr } = await supabase
                .from('tickets')
                .delete()
                .eq('event_id', id);

            if (ticketErr) throw ticketErr;

            // 2. Delete the event
            const { error: eventErr } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (eventErr) throw eventErr;

            dispatch({ type: 'DELETE_EVENT', payload: id });
            toast.success('Event and all bookings deleted.');
        } catch (error) {
            console.error("Delete Event Error:", error);
            toast.error(error.message || 'Failed to delete event.');
        }
    };

    // ── Derived filtered events ───────────────────────────────────────────────
    const getFilteredEvents = () => {
        let result = [...state.events];
        if (state.search.trim()) {
            const q = state.search.toLowerCase();
            result = result.filter(e =>
                e.title.toLowerCase().includes(q) ||
                (e.description || '').toLowerCase().includes(q) ||
                (e.location || '').toLowerCase().includes(q)
            );
        }
        if (state.filterStatus !== 'all') {
            result = result.filter(e => e.category === state.filterStatus);
        }
        return result;
    };

    return (
        <EventContext.Provider value={{
            ...state,
            filteredEvents: getFilteredEvents(),
            fetchPublicEvents,
            fetchMyEvents,
            fetchEventById,
            createEvent,
            updateEvent,
            deleteEvent,
            setSearch: (v) => dispatch({ type: 'SET_SEARCH', payload: v }),
            setFilterStatus: (v) => dispatch({ type: 'SET_FILTER_STATUS', payload: v }),
        }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => {
    const ctx = useContext(EventContext);
    if (!ctx) throw new Error('useEvents must be used within EventProvider');
    return ctx;
};
