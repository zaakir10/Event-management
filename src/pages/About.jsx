import { Code, Server, Shield, Globe, Cpu, Users, Ticket, Calendar, Zap } from 'lucide-react';

const About = () => {
    const techs = [
        { name: 'React 18', icon: <Cpu />, desc: 'Powering a smooth, reactive user interface.' },
        { name: 'Supabase', icon: <Server />, desc: 'Rock-solid Auth, Postgres, and Realtime sync.' },
        { name: 'Tailwind CSS', icon: <Globe />, desc: 'Modern styling with a focus on premium aesthetics.' },
        { name: 'Lucide Icons', icon: <Zap />, desc: 'Lightweight and expressive visual elements.' },
    ];

    const stats = [
        { label: 'Real-time Sync', value: '100ms', desc: 'Latency for data updates' },
        { label: 'Security', value: 'AES-256', desc: 'Enterprise-grade encryption' },
        { label: 'Availability', value: '99.9%', desc: 'Platform uptime guarantee' },
    ];

    return (
        <div className="bg-white">
            {/* Header Section */}
            <section className="relative py-24 bg-slate-50 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-sky-200 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-100 rounded-full">
                        Elevating Experiences
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                        The future of event <br />
                        <span className="text-sky-600">orchestration.</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl text-slate-500 leading-relaxed">
                        EventManager is a next-generation platform designed to bridge the gap between organizers and attendees.
                        We combine powerful management tools with a seamless booking experience.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-200">
                            <Shield size={32} />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900">Built on a foundation of trust and security.</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Security isn't just a feature — it's our core philosophy. Every transaction, ticket booking,
                            and user interaction is protected by industry-standard Row Level Security (RLS).
                            Your data never leaves your control.
                        </p>
                        <ul className="space-y-4">
                            {[
                                { icon: <Users className="text-sky-600" />, text: 'Multi-role support: Organizer & Attendee' },
                                { icon: <Ticket className="text-sky-600" />, text: 'Secure QR-code ticket verification' },
                                { icon: <Calendar className="text-sky-600" />, text: 'Real-time capacity management' }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-700 font-semibold p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    {item.icon}
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {techs.map((tech) => (
                            <div key={tech.name} className="p-8 bg-white border border-slate-200 rounded-[32px] hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-100 transition-all group">
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-6 bg-slate-50 text-sky-600 group-hover:scale-110 transition-transform">
                                    {tech.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{tech.name}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-slate-900 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center group">
                                <p className="text-5xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors">{stat.value}</p>
                                <p className="text-sky-500 font-bold uppercase tracking-widest text-xs mb-4">{stat.label}</p>
                                <p className="text-slate-400 text-sm">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-sky-600 opacity-20 rounded-full blur-[120px]" />
            </section>

            {/* Values Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-black text-slate-900 mb-16">The EventManager Promise</h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Lightning Fast</h3>
                        <p className="text-slate-500">Zero-latency interactions powered by Supabase Realtime engine.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="mx-auto w-14 h-14 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">User Centric</h3>
                        <p className="text-slate-500">Designed for people, not just data. Intuitive flows everywhere.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-600 flex items-center justify-center rounded-2xl">
                            <Ticket size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Scalable</h3>
                        <p className="text-slate-500">From 10 attendees to 10,000. Our infrastructure grows with you.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
