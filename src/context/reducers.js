// ─── Auth Reducer ────────────────────────────────────────────────────────────
export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, user: action.payload, isAuthenticated: true, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

// ─── Task Reducer ────────────────────────────────────────────────────────────
export const taskReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TASKS': return { ...state, tasks: action.payload, loading: false };
        case 'ADD_TASK': return { ...state, tasks: [action.payload, ...state.tasks] };
        case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
        case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'SET_LOADING': return { ...state, loading: action.payload };
        case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
        case 'SET_SEARCH': return { ...state, search: action.payload };
        case 'SET_FILTER_STATUS': return { ...state, filterStatus: action.payload };
        case 'SET_FILTER_PRIORITY': return { ...state, filterPriority: action.payload };
        case 'SET_FILTER_CATEGORY': return { ...state, filterCategory: action.payload };
        case 'SET_SORT': return { ...state, sort: action.payload };
        default: return state;
    }
};

// ─── Event Reducer ────────────────────────────────────────────────────────────
export const eventReducer = (state, action) => {
    switch (action.type) {
        case 'SET_EVENTS':
            return { ...state, events: action.payload, loading: false };
        case 'ADD_EVENT':
            return { ...state, events: [action.payload, ...state.events] };
        case 'UPDATE_EVENT':
            return { ...state, events: state.events.map(e => e.id === action.payload.id ? action.payload : e) };
        case 'DELETE_EVENT':
            return { ...state, events: state.events.filter(e => e.id !== action.payload) };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_SEARCH':
            return { ...state, search: action.payload };
        case 'SET_FILTER_STATUS':
            return { ...state, filterStatus: action.payload };
        default:
            return state;
    }
};

// ─── Ticket Reducer ───────────────────────────────────────────────────────────
export const ticketReducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_TICKET_START':
            return { ...state, loading: true, error: null };
        case 'CREATE_TICKET_SUCCESS':
            return {
                ...state,
                tickets: [action.payload, ...state.tickets],
                loading: false
            };
        case 'CREATE_TICKET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_TICKETS':
            return { ...state, tickets: action.payload, loading: false };
        case 'ADD_TICKET':
            return { ...state, tickets: [action.payload, ...state.tickets] };
        case 'UPDATE_TICKET':
            return { ...state, tickets: state.tickets.map(t => t.id === action.payload.id ? action.payload : t) };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};
