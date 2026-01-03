import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Image as ImageIcon, ArrowRight, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';

export const EventCreation: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    image: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const eventId = await createEvent({
        name: formData.name,
        date: new Date(formData.date),
        description: formData.description,
        image: formData.image,
      });
      
      // Wait a moment for the event to be fully created and fetched
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate(`/events/${eventId}/contacts`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  const suggestedImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=300&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 1 of 3</span>
            <span className="text-sm text-text-muted">Event Details</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Event</h1>
            <p className="text-text-muted">Let's start by setting up your event details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Event Name"
              name="name"
              placeholder="e.g., Weekend Trip, Office Lunch"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Input
              label="Event Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Add any additional details about the event..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Event Image (Optional)
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-text-secondary" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {suggestedImages.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleImageSelect(url)}
                      className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                    >
                      <img 
                        src={url} 
                        alt={`Suggestion ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-error">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                fullWidth
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon={ArrowRight}
                iconPosition="right"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Next: Add Participants'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
