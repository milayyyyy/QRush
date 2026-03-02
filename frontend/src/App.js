import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { supabase } from './config/supabase';

// Components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import EventsPage from './pages/EventsPage';
import EventDetails from './pages/EventDetails';
import TicketView from './pages/TicketView';
import CreateEvent from './pages/CreateEvent';
import QRScanner from './pages/QRScanner';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from './components/ui/sonner';

// Authentication context
const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from Supabase on startup
  const restoreSession = useCallback(async () => {
    try {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();
        if (userRow) {
          setUser({
            id: userRow.user_id,
            email: userRow.email,
            name: userRow.name,
            role: (userRow.role || 'attendee').toLowerCase(),
            contact: userRow.contact || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRow.email}`,
          });
        } else {
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: meta.name || session.user.email.split('@')[0],
            role: (meta.role || 'attendee').toLowerCase(),
            contact: meta.contact || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          });
        }
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [restoreSession]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut().catch(() => null);
    setUser(null);
  };

  const authValue = React.useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QRush...</p>
        </div>
      </div>
    );
  }

  const defaultRoute = user ? '/dashboard' : '/auth';

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="App min-h-screen bg-black">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'attendee' ? <AttendeeDashboard /> :
                  user.role === 'organizer' ? <OrganizerDashboard /> :
                  user.role === 'staff' ? <StaffDashboard /> :
                  <Navigate to="/auth" />
                ) : (
                  <Navigate to="/auth" />
                )
              } 
            />
            <Route 
              path="/ticket/:ticketId" 
              element={user ? <TicketView /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/create-event" 
              element={
                user && user.role === 'organizer' ? 
                <CreateEvent /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/create-event/:eventId" 
              element={
                user && user.role === 'organizer' ? 
                <CreateEvent /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/scan" 
              element={
                user && user.role === 'staff' ? 
                <QRScanner /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <SettingsPage /> : <Navigate to="/auth" />} 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;