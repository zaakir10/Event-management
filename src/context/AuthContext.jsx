import { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authReducer } from './reducers';

const AuthContext = createContext();

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
};

// ── Helper: upsert a row in public.profiles ────────────────────────────────
const upsertProfile = async (userId, fullName, avatarUrl) => {
    await supabase.from('profiles').upsert(
        { id: userId, full_name: fullName, avatar_url: avatarUrl },
        { onConflict: 'id' }
    );
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ── Update User State (Sync) ──────────────────────────────────────────────
    const refreshUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
            dispatch({ type: 'LOGIN', payload: user });
            const name = user.user_metadata?.full_name;
            const avatar = user.user_metadata?.avatar_url;
            if (name) upsertProfile(user.id, name, avatar).catch(console.error);
        }
    };

    useEffect(() => {
        // Restore existing session on app load
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                dispatch({ type: 'LOGIN', payload: session.user });
                refreshUser(); // Ensure profiles stay in sync
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        getSession();

        // Listen for future auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
                        dispatch({ type: 'LOGIN', payload: session.user });
                    }

                    const name = session.user.user_metadata?.full_name;
                    const avatar = session.user.user_metadata?.avatar_url;
                    if (name) upsertProfile(session.user.id, name, avatar).catch(console.error);
                } else if (event === 'SIGNED_OUT') {
                    dispatch({ type: 'LOGOUT' });
                }
            }
        );

        return () => { subscription?.unsubscribe(); };
    }, []);

    // ── Login ──────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    // ── Register ───────────────────────────────────────────────────────────────
    // Creates auth user AND inserts a matching row in public.profiles
    const register = async (email, password, fullName, avatarUrl = '') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, avatar_url: avatarUrl } },
        });
        if (error) throw error;

        // Insert profile row immediately after signup
        if (data.user) {
            await upsertProfile(data.user.id, fullName, avatarUrl);
        }

        return data;
    };

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
