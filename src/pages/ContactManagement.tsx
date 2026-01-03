import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, Trash2, ArrowRight, Crown, User, Smartphone, QrCode, CreditCard } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';

export const ContactManagement: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { events, addParticipant, removeParticipant } = useApp();
  
  const event = events.find(e => e.id === eventId);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'participant' as 'organizer' | 'participant',
    tngNumber: '',
    duitnowId: '',
    qrCode: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // At least one payment method is recommended
    if (!formData.tngNumber && !formData.duitnowId && !formData.qrCode) {
      newErrors.payment = 'Please provide at least one payment method for easier settlements';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !eventId) return;
    
    addParticipant(eventId, {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      paymentMethod: {
        tngNumber: formData.tngNumber || undefined,
        duitnowId: formData.duitnowId || undefined,
        qrCode: formData.qrCode || undefined,
      },
    });
    
    setFormData({ 
      name: '', 
      phone: '', 
      role: 'participant',
      tngNumber: '',
      duitnowId: '',
      qrCode: '',
    });
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (eventId) {
      removeParticipant(eventId, participantId);
    }
  };

  const handleNext = () => {
    if (!event?.participants.length) {
      setErrors({ general: 'Please add at least one participant' });
      return;
    }
    navigate(`/events/${eventId}/bill`);
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 2 of 3</span>
            <span className="text-sm text-text-muted">Add Participants</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Manage Participants</h1>
          <p className="text-text-muted">Add people who will share expenses for "{event.name}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Participant Form */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <UserPlus size={24} className="text-primary" />
              Add Participant
            </h2>
            
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <Input
                label="Name"
                name="name"
                placeholder="Enter participant name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+60 12-345 6789"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="participant">Participant</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  Payment Methods (Optional but Recommended)
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                      <Smartphone size={16} />
                      Touch 'n Go Number
                    </label>
                    <input
                      type="tel"
                      name="tngNumber"
                      placeholder="012-345 6789"
                      value={formData.tngNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                      <CreditCard size={16} />
                      DuitNow ID
                    </label>
                    <input
                      type="text"
                      name="duitnowId"
                      placeholder="Email or phone number"
                      value={formData.duitnowId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                      <QrCode size={16} />
                      QR Code URL
                    </label>
                    <input
                      type="url"
                      name="qrCode"
                      placeholder="https://example.com/qr-code.png"
                      value={formData.qrCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      Upload your payment QR code to an image host and paste the URL
                    </p>
                  </div>
                </div>

                {errors.payment && (
                  <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    {errors.payment}
                  </p>
                )}
              </div>

              <Button type="submit" icon={UserPlus} fullWidth>
                Add Participant
              </Button>
            </form>
          </Card>

          {/* Participants List */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Participants ({event.participants.length})
            </h2>
            
            {event.participants.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <User size={48} className="mx-auto mb-3 opacity-30" />
                <p>No participants added yet</p>
                <p className="text-sm mt-1">Add your first participant to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {event.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-start justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-text-primary truncate">{participant.name}</p>
                          {participant.role === 'organizer' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                              <Crown size={12} />
                              Organizer
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted mb-2">{participant.phone}</p>
                        
                        {participant.paymentMethod && (
                          <div className="flex flex-wrap gap-2">
                            {participant.paymentMethod.tngNumber && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                <Smartphone size={12} />
                                TnG
                              </span>
                            )}
                            {participant.paymentMethod.duitnowId && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                <CreditCard size={12} />
                                DuitNow
                              </span>
                            )}
                            {participant.paymentMethod.qrCode && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                <QrCode size={12} />
                                QR
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-error rounded-lg text-error text-sm">
            {errors.general}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/events/${eventId}`)}
            fullWidth
          >
            Back
          </Button>
          <Button
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleNext}
            fullWidth
          >
            Next: Add Expenses
          </Button>
        </div>
      </div>
    </div>
  );
};
