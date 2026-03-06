import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [config, setConfig] = useState(null);

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                resolve
            });
        });
    }, []);

    const confirm = useCallback((title, message, type = 'warning') => {
        return showAlert({
            title,
            message,
            type,
            showCancel: true,
            confirmText: 'Confirm',
            cancelText: 'Cancel'
        });
    }, [showAlert]);

    const alert = useCallback((title, message, type = 'info') => {
        return showAlert({
            title,
            message,
            type,
            showCancel: false,
            confirmText: 'Okay'
        });
    }, [showAlert]);

    const close = (value) => {
        if (config?.resolve) config.resolve(value);
        setConfig(null);
    };

    return (
        <AlertContext.Provider value={{ alert, confirm }}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => close(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${config.type === 'danger' || config.type === 'warning' ? 'bg-rose-50 text-rose-500' :
                                            config.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                                'bg-sky-50 text-sky-500'
                                        }`}>
                                        {config.type === 'danger' || config.type === 'warning' ? <AlertTriangle size={32} /> :
                                            config.type === 'success' ? <CheckCircle2 size={32} /> :
                                                <Info size={32} />}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-2">{config.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{config.message}</p>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        onClick={() => close(true)}
                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${config.type === 'danger' || config.type === 'warning' ? 'bg-rose-600 text-white shadow-rose-200' :
                                                config.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-200' :
                                                    'bg-sky-600 text-white shadow-sky-200'
                                            }`}
                                    >
                                        {config.confirmText}
                                    </button>

                                    {config.showCancel && (
                                        <button
                                            onClick={() => close(false)}
                                            className="w-full py-4 rounded-2xl font-bold text-slate-400 text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            {config.cancelText}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within AlertProvider');
    return context;
};
