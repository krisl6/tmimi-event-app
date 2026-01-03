import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Calendar, DollarSign, ArrowRight, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export const JoinEvent: React.FC = () => {
  const navigate = useNavigate();
  const { eventCode } = useParams<{ eventCode: string }>();
  const { events, user, findEventByCode } = useApp();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const findEvent = async () => {
      try {
        if (!eventCode) {
          setError('Invalid event code');
          setLoading(false);
          return;
        }

        // First try to find in local events (for logged-in users)
        const localEvent = events.find(e => 
          e.id === eventCode || e.eventCode?.toUpperCase() === eventCode.toUpperCase()
        );
        
        if (localEvent) {
          setEvent(localEvent);
          setLoading(false);
          return;
        }

        // If not found locally, try to fetch by code from database
        const foundEvent = await findEventByCode(eventCode);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Event not found. Please check the code and try again.');
        }
      } catch (err) {
        setError('Failed to load event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    findEvent();
  }, [eventCode, events, findEventByCode]);

  const handleJoin = () => {
    if (!user) {
      navigate(`/auth?redirect=/events/join/${eventCode}`);
      return;
    }

    if (event) {
      navigate(`/events/${event.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-text-muted">Loading event...</p>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Event Not Found</h2>
          <p className="text-text-muted mb-6">{error || 'This event does not exist or has been deleted.'}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')} fullWidth>
              Go Home
            </Button>
            <Button onClick={() => navigate('/events/new')} fullWidth>
              Create Event
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalExpenses = event.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          {event.image && (
            <div className="rounded-xl overflow-hidden mb-6 -mx-6 -mt-6">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-3">
              You've been invited!
            </h1>
            <p className="text-xl text-text-muted">
              Join <span className="font-semibold text-text-primary">{event.name}</span>
            </p>
            {event.eventCode && (
              <div className="mt-4 inline-block px-6 py-3 bg-blue-50 rounded-lg border-2 border-primary">
                <p className="text-xs text-text-muted mb-1">Event Code</p>
                <p className="text-3xl font-bold text-primary tracking-wider">
                  {event.eventCode}
                </p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Calendar size={24} />
                  <span className="text-2xl font-bold">{format(event.date, 'MMM dd')}</span>
                </div>
                <p className="text-sm text-text-muted">Event Date</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-success mb-2">
                  <Users size={24} />
                  <span className="text-2xl font-bold">{event.participants.length}</span>
                </div>
                <p className="text-sm text-text-muted">Participants</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                  <DollarSign size={24} />
                  <span className="text-2xl font-bold">${totalExpenses.toFixed(0)}</span>
                </div>
                <p className="text-sm text-text-muted">Total Expenses</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-text-primary mb-2">About this event</h3>
              <p className="text-text-muted">{event.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-3">Participants</h3>
            <div