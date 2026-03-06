import { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ticketReducer } from './reducers';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TicketContext = createContext();

const initialState = {
    tickets: [],
    loading: false,
    error: null,
};

export const TicketProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ticketReducer, initialState);
    const { user } = useAuth();

    // ── Fetch current user's tickets (with event details joined) ─────────────
    const fetchMyTickets = useCallback(async () => {
        if (!user) return;
        dispatch({ type: 'SET_LOADING', payload: true });

        const { data, error } = await supabase
            .from('tickets')
            .select('*, events(title, event_date, location, cover_image)')
            .eq('user_id', user.id)
            .order('booked_at', { ascending: false });

        if (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } else {
            dispatch({ type: 'SET_TICKETS', payload: data });
        }
    }, [user]);

    // ── Fetch tickets for a specific event (organizer view) ───────────────────
    const fetchEventTickets = async (eventId) => {
        try {
            // First try with the join (simplified for easier RLS matching)
            const { data, error } = await supabase
                .from('tickets')
                .select('*, profiles(full_name, avatar_url)')
                .eq('event_id', eventId)
                .order('booked_at', { ascending: false });

            if (!error && data) return data;

            // Fallback: without join
            console.warn("fetchEventTickets with join failed, trying basic fallback...", error);
            const { data: basic, error: basicError } = await supabase
                .from('tickets')
                .select('*')
                .eq('event_id', eventId)
                .order('booked_at', { ascending: false });

            if (basicError) {
                console.error("fetchEventTickets Total Failure:", basicError);
                throw basicError;
            }
            return basic;
        } catch (e) {
            console.error("fetchEventTickets Catch Block:", e);
            throw e;
        }
    };

    // ── Book a ticket (MANDATORY LOGIC) ───────────────────────────────────────
    const bookTicket = async (eventId) => {
        if (!user) return;
        if (!eventId) {
            console.error("bookTicket: No eventId provided");
            toast.error("Internal error: Event ID missing");
            return;
        }

        dispatch({ type: 'CREATE_TICKET_START' });

        try {
            // 1. Check if user already has a ticket for this event
            const { data: existing, error: existErr } = await supabase
                .from('tickets')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existErr) throw existErr;
            if (existing) {
                const errMsg = 'You already have a ticket for this event!';
                toast.error(errMsg);
                dispatch({ type: 'CREATE_TICKET_ERROR', payload: errMsg });
                return;
            }

            // 2. Fetch current available tickets for the event
            console.log("Supabase: Fetching event details for booking:", eventId);
            const { data: event, error: eventErr } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .maybeSingle();

            if (eventErr) {
                console.error("Supabase error fetching event:", eventErr);
                throw eventErr;
            }
            if (!event) {
                console.error("Event not found in database for ID:", eventId);
                throw new Error('Event not found or access denied. Please refresh the page.');
            }

            if (event.available_tickets !== null && event.available_tickets <= 0) {
                const errMsg = 'Sorry, this event is already sold out.';
                toast.error(errMsg);
                dispatch({ type: 'CREATE_TICKET_ERROR', payload: errMsg });
                return;
            }

            // 3. Generate a unique QR code string
            const qrCode = `TK-${eventId.toString().slice(0, 4)}-${user.id.toString().slice(0, 4)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

            // 4. Insert ticket into tickets table
            const { data: ticketData, error: ticketErr } = await supabase
                .from('tickets')
                .insert([{
                    event_id: eventId,
                    user_id: user.id,
                    status: 'active',
                    qr_code: qrCode
                }])
                .select('*, events(title, event_date, location, cover_image)')
                .single();

            if (ticketErr) {
                console.error("Supabase error inserting ticket:", ticketErr);
                throw ticketErr;
            }

            // 5. Update event: Decrease available_tickets by 1
            if (event.available_tickets !== null) {
                const { error: updateErr } = await supabase
                    .from('events')
                    .update({ available_tickets: event.available_tickets - 1 })
                    .eq('id', eventId);
                if (updateErr) console.warn("Failed to decrement available tickets:", updateErr);
            }

            // 6. Dispatch success and show toast
            dispatch({ type: 'CREATE_TICKET_SUCCESS', payload: ticketData });
            toast.success('🎟️ Ticket booked successfully!');
            return ticketData;

        } catch (error) {
            const errMsg = error.message || 'Booking failed.';
            console.error("Booking catch block error:", error);
            toast.error(errMsg);
            dispatch({ type: 'CREATE_TICKET_ERROR', payload: errMsg });
            throw error;
        }
    };

    // ── Cancel a ticket ───────────────────────────────────────────────────────
    const cancelTicket = async (ticketId) => {
        const { data, error } = await supabase
            .from('tickets')
            .update({ status: 'cancelled' })
            .eq('id', ticketId)
            .select('*, events(title, event_date, location, cover_image)');

        if (error) { toast.error('Failed to cancel ticket.'); throw error; }
        dispatch({ type: 'UPDATE_TICKET', payload: data[0] });
        toast.success('Ticket cancelled.');
    };

    // ── Mark ticket as used (organizer scans) ────────────────────────────────
    const markTicketUsed = async (ticketId) => {
        const { data, error } = await supabase
            .from('tickets')
            .update({ status: 'used' })
            .eq('id', ticketId)
            .select();
        if (error) { toast.error('Failed to mark ticket.'); throw error; }
        dispatch({ type: 'UPDATE_TICKET', payload: data[0] });
        toast.success('Ticket marked as used ✅');
    };

    const markAllTicketsUsed = async (eventId) => {
        const { data, error } = await supabase
            .from('tickets')
            .update({ status: 'used' })
            .eq('event_id', eventId)
            .eq('status', 'active')
            .select();

        if (error) { toast.error('Failed to check in all attendees.'); throw error; }

        // Update local state for all changed tickets
        if (data) {
            data.forEach(ticket => {
                dispatch({ type: 'UPDATE_TICKET', payload: ticket });
            });
        }

        toast.success(`Checked in ${data?.length || 0} attendees! ✅`);
        return data;
    };

    return (
        <TicketContext.Provider value={{
            ...state,
            fetchMyTickets,
            fetchEventTickets,
            bookTicket,
            cancelTicket,
            markTicketUsed,
            markAllTicketsUsed,
        }}>
            {children}
        </TicketContext.Provider>
    );
};

export const useTickets = () => {
    const ctx = useContext(TicketContext);
    if (!ctx) throw new Error('useTickets must be used within TicketProvider');
    return ctx;
};
