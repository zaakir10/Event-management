import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { EventProvider } from './context/EventContext';
import { TicketProvider } from './context/TicketContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AlertProvider } from './context/AlertContext';

function App() {
  return (
    <Router>
      <AlertProvider>
        <AuthProvider>
          <TaskProvider>
            <EventProvider>
              <TicketProvider>
                <div className="flex flex-col min-h-screen bg-slate-50">
                  <Navbar />
                  <main className="flex-grow">
                    <AppRoutes />
                  </main>
                  <Footer />
                </div>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      borderRadius: '12px',
                      background: '#1e293b',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '12px 16px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                  }}
                />
              </TicketProvider>
            </EventProvider>
          </TaskProvider>
        </AuthProvider>
      </AlertProvider>
    </Router>
  );
}

export default App;
