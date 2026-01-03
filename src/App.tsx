import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { EventCreation } from './pages/EventCreation';
import { ContactManagement } from './pages/ContactManagement';
import { BillInput } from './pages/BillInput';
import { ExpenseSummary } from './pages/ExpenseSummary';
import { Authentication } from './pages/Authentication';
import { EventDashboard } from './pages/EventDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Authentication />} />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <EventCreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute>
                <EventDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/contacts"
            element={
              <ProtectedRoute>
                <ContactManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/bill"
            element={
              <ProtectedRoute>
                <BillInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/summary"
            element={
              <ProtectedRoute>
                <ExpenseSummary />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
