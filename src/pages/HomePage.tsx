import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, DollarSign, Share2, LogIn, QrCode } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ShareEventModal } from '../components/ShareEventModal';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, events } = useApp();
  const [joinCode, setJoinCode] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleCreateEvent = () => {
    navigate('/events/new');
  };

  const handleJoinEvent = () => {
    if (joinCode.trim()) {
      navigate(`/events/join/${joinCode.trim().toUpperCase()}`);
    }
  };

  const handleShareEvent = (event: any) => {
    setSelectedEvent(event);
    setShareModalOpen(true);
  };

  const getEventStats = (event: any) => {
    const totalExpenses = event.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    return {
      participants: event.participants.length,
      expenses: event.expenses.length,
      total: totalExpenses,
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Welcome to Tmimi</h2>
          <p className="text-text-muted mb-6">Please sign in to create and manage events</p>
          <Button icon={LogIn} onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-text-muted">
            Create a new event or join an existing one
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Create Event Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-primary hover:shadow-xl transition-shadow cursor-pointer" onClick={handleCreateEvent}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Plus className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Create Event</h2>
                <p className="text-text-muted">Start a new expense group</p>
              </div>
            </div>
            <Button icon={Plus} fullWidth onClick={handleCreateEvent}>
              Create New Event
            </Button>
          </Card>

          {/* Join Event Card */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-success hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
                <Share2 className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Join Event</h2>
                <p className="text-text-muted">Enter 6-character code</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinEvent()}
                maxLength={6}
                className="uppercase text-center text-lg font-bold tracking-wider"
              />
              <Button 
                icon={LogIn} 
                onClick={handleJoinEvent}
                disabled={!joinCode.trim() || joinCode.length !== 6}
              >
                Join
              </Button>
            </div>
          </Card>
        </div>

        {/* My Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-text-primary">My Events</h2>
            {events.length > 0 && (
              <span className="text-text-muted">{events.length} event{events.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {events.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar size={64} className="mx-auto mb-4 text-text-muted opacity-30" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No events yet</h3>
              <p className="text-text-muted mb-6">Create your first event to start splitting expenses</p>
              <Button icon={Plus} onClick={handleCreateEvent}>
                Create Your First Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const stats = getEventStats(event);

                return (
                  <Card 
                    key={event.id}
                    className="hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {event.image && (
                      <div className="rounded-lg overflow-hidden mb-4 -mx-6 -mt-6">
                        <img 
                          src={event.image} 
                          alt={event.name}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                      <Calendar size={16} />
                      <span>{format(event.date, 'MMM dd, yyyy')}</span>
                    </div>

                    {event.eventCode && (
                      <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg border border-primary">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted">Event Code:</span>
                          <span className="text-lg font-bold text-primary tracking-wider">
                            {event.eventCode}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-border">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Users size={16} />
                          <span className="font-bold">{stats.participants}</span>
                        </div>
                        <p className="text-xs text-text-muted">People</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-success mb-1">
                          <DollarSign size={16} />
                          <span className="font-bold">{stats.expenses}</span>
                        </div>
                        <p className="text-xs text-text-muted">Expenses</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <span className="font-bold">${stats.total.toFixed(0)}</span>
                        </div>
                        <p className="text-xs text-text-muted">Total</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={QrCode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareEvent(event);
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {selectedEvent && (
        <ShareEventModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedEvent(null);
          }}
          eventId={selectedEvent.id}
          eventCode={selectedEvent.eventCode || ''}
          eventName={selectedEvent.name}
        />
      )}
    </div>
  );
};
