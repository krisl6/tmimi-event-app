import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Users, DollarSign, Plus, TrendingUp, Clock, Tag } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export const EventDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useApp();
  
  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Event Not Found</h2>
          <p className="text-text-muted mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  const totalExpenses = event.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPersonAverage = totalExpenses / event.participants.length;

  // Calculate balances
  const balances: Record<string, number> = {};
  event.participants.forEach(p => {
    balances[p.id] = 0;
  });

  event.expenses.forEach(expense => {
    balances[expense.paidBy] += expense.amount;
    Object.entries(expense.shares).forEach(([participantId, share]) => {
      balances[participantId] -= share;
    });
  });

  // Sort expenses by date (newest first)
  const sortedExpenses = [...event.expenses].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="mb-8">
          {event.image && (
            <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-text-muted">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{format(event.date, 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{event.participants.length} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} />
                  <span>{event.expenses.length} expenses</span>
                </div>
              </div>
              {event.description && (
                <p className="mt-3 text-text-secondary">{event.description}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/events/${eventId}/contacts`)}
              >
                Manage Participants
              </Button>
              <Button
                icon={Plus}
                onClick={() => navigate(`/events/${eventId}/bill`)}
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-text-primary">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="text-primary" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Per Person</p>
                <p className="text-3xl font-bold text-text-primary">${perPersonAverage.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="text-success" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Transactions</p>
                <p className="text-3xl font-bold text-text-primary">{event.expenses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">Expense Timeline</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/events/${eventId}/summary`)}
                >
                  View Summary
                </Button>
              </div>

              {sortedExpenses.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No expenses recorded yet</p>
                  <p className="text-sm mt-1">Add your first expense to get started</p>
                  <Button
                    className="mt-4"
                    icon={Plus}
                    onClick={() => navigate(`/events/${eventId}/bill`)}
                  >
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {sortedExpenses.map((expense) => {
                    const payer = event.participants.find(p => p.id === expense.paidBy);
                    
                    return (
                      <div
                        key={expense.id}
                        className="p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {expense.description}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{format(expense.date, 'MMM dd, h:mm a')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag size={14} />
                                <span>{expense.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">${expense.amount.toFixed(2)}</p>
                            <p className="text-sm text-text-muted">paid by {payer?.name}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-text-muted mb-2">Split {expense.splitType === 'equal' ? 'equally' : 'custom'}:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(expense.shares).map(([participantId, share]) => {
                              const participant = event.participants.find(p => p.id === participantId);
                              return (
                                <span
                                  key={participantId}
                                  className="px-2 py-1 bg-blue-50 text-primary text-xs rounded-full"
                                >
                                  {participant?.name}: ${share.toFixed(2)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Participants & Balances */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Participants</h2>
              <div className="space-y-3">
                {event.participants.map((participant) => {
                  const balance = balances[participant.id];
                  const isPositive = balance > 0;
                  const isZero = Math.abs(balance) < 0.01;
                  
                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{participant.name}</p>
                          <p className="text-xs text-text-muted">{participant.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isZero ? (
                          <span className="text-xs text-success">Settled</span>
                        ) : (
                          <>
                            <p className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
                              {isPositive ? '+' : ''}${balance.toFixed(2)}
                            </p>
                            <p className="text-xs text-text-muted">
                              {isPositive ? 'owed' : 'owes'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-primary">
              <h3 className="font-semibold text-text-primary mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/events/${eventId}/bill`)}
                >
                  Add Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/events/${eventId}/summary`)}
                >
                  View Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/events/${eventId}/contacts`)}
                >
                  Manage Participants
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
