import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield, Save, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, refreshUser } = useAuth();

    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // ── Load profile from public.profiles on mount ────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            setFetching(true);

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    // Only set state if current value is empty to avoid overwriting user input
                    setFullName(prev => prev || data.full_name || user?.user_metadata?.full_name || '');
                    setAvatarUrl(prev => prev || data.avatar_url || user?.user_metadata?.avatar_url || '');
                } else {
                    setFullName(prev => prev || user?.user_metadata?.full_name || '');
                    setAvatarUrl(prev => prev || user?.user_metadata?.avatar_url || '');
                }
            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setFetching(false);
            }
        };

        loadProfile();
    }, [user?.id]);

    // ── Save: write to BOTH auth metadata and public.profiles ────────────────
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1️⃣  Update Supabase Auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName, avatar_url: avatarUrl },
            });
            if (authError) throw authError;

            // 2️⃣  Upsert into public.profiles table (this is what shows in DB)
            const { error: dbError } = await supabase
                .from('profiles')
                .upsert(
                    { id: user.id, full_name: fullName, avatar_url: avatarUrl },
                    { onConflict: 'id' }
                );
            if (dbError) throw dbError;

            // 3️⃣  SYNC the local user state so everyone else sees the update
            await refreshUser();

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            toast.success('Profile saved!');
        } catch (err) {
            const msg = err.message || 'Failed to update profile.';
            setMessage({ type: 'error', text: msg });
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* ── Avatar + name header ── */}
            <div className="mb-10 text-center">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl overflow-hidden bg-sky-50"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <User size={48} style={{ color: '#0284c7' }} />
                    )}
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                    {fetching ? '...' : fullName || 'User'}
                </h1>
                <p className="text-slate-500 mt-1">{user?.email}</p>
            </div>

            {/* ── Form card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Shield size={20} style={{ color: '#0284c7' }} />
                        Account Details
                    </h2>

                    {/* Message banner */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border ${message.type === 'success'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                            {message.type === 'success'
                                ? <CheckCircle2 size={18} />
                                : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <User size={15} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={fetching}
                                    placeholder="Enter your full name"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 outline-none transition-all disabled:opacity-50"
                                    style={{ '--tw-ring-color': '#0284c7' }}
                                />
                            </div>

                            {/* Avatar URL */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon size={15} /> Avatar Image URL
                                </label>
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    disabled={fetching}
                                    placeholder="https://example.com/photo.jpg"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 outline-none transition-all disabled:opacity-50"
                                    style={{ '--tw-ring-color': '#0284c7' }}
                                />
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Mail size={15} /> Email Address
                                <span className="text-xs font-normal text-slate-400 ml-1">(read-only)</span>
                            </label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ''}
                                className="block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Member since */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Calendar size={15} /> Member Since
                                </label>
                                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                        : 'N/A'}
                                </div>
                            </div>

                            {/* User ID */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Shield size={15} /> User ID
                                </label>
                                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-mono truncate">
                                    {user?.id?.slice(0, 8) || 'N/A'}...
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || fetching}
                                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-md hover:brightness-110"
                                style={{ backgroundColor: '#0284c7' }}
                            >
                                {loading
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <Save size={18} />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Info note ── */}
            <p className="mt-4 text-center text-xs text-slate-400">
                Changes are saved to your Supabase <code className="bg-slate-100 px-1 rounded">profiles</code> table and auth metadata.
            </p>
        </div>
    );
};

export default Profile;
