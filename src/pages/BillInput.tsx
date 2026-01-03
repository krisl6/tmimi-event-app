import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Receipt, Upload, ArrowRight, DollarSign, Camera, X, Scan, CheckCircle, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';

export const BillInput: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { events, addExpense, user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const event = events.find(e => e.id === eventId);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    splitType: 'equal' as 'equal' | 'custom' | 'selective',
    paidBy: user?.id || '1',
  });
  
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(event?.participants.map(p => p.id) || [])
  );
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const categories = ['Food', 'Transportation', 'Accommodation', 'Entertainment', 'Shopping', 'Other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  const handleCustomShareChange = (participantId: string, value: string) => {
    setCustomShares(prev => ({ ...prev, [participantId]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, receipt: 'Please upload an image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setErrors(prev => ({ ...prev, receipt: '' }));
        performMockOCR();
      };
      reader.readAsDataURL(file);
    }
  };

  const performMockOCR = () => {
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      const mockOCRResults = {
        description: 'Restaurant Dinner',
        amount: '127.50',
        category: 'Food',
      };

      setFormData(prev => ({
        ...prev,
        description: mockOCRResults.description,
        amount: mockOCRResults.amount,
        category: mockOCRResults.category,
      }));

      setIsScanning(false);
      setScanComplete(true);

      setTimeout(() => {
        setScanComplete(false);
      }, 3000);
    }, 2000);
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
    setScanComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (selectedParticipants.size === 0) {
      newErrors.participants = 'Please select at least one participant';
    }
    
    if (formData.splitType === 'custom') {
      const total = Object.values(customShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(total - parseFloat(formData.amount)) > 0.01) {
        newErrors.shares = 'Custom shares must equal total amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !eventId || !event) return;
    
    const amount = parseFloat(formData.amount);
    let shares: Record<string, number> = {};
    
    const participantsInvolved = Array.from(selectedParticipants);
    
    if (formData.splitType === 'equal' || formData.splitType === 'selective') {
      const shareAmount = amount / participantsInvolved.length;
      participantsInvolved.forEach(id => {
        shares[id] = shareAmount;
      });
    } else {
      shares = Object.fromEntries(
        Object.entries(customShares)
          .filter(([id]) => selectedParticipants.has(id))
          .map(([id, val]) => [id, parseFloat(val) || 0])
      );
    }
    
    addExpense(eventId, {
      description: formData.description,
      amount,
      category: formData.category,
      paidBy: formData.paidBy,
      splitType: formData.splitType,
      shares,
      selectedParticipants: participantsInvolved,
      receipt: receiptImage || undefined,
    });
    
    navigate(`/events/${eventId}/summary`);
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  const selectedCount = selectedParticipants.size;
  const equalShare = formData.amount && selectedCount > 0 
    ? (parseFloat(formData.amount) / selectedCount).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 3 of 3</span>
            <span className="text-sm text-text-muted">Add Expense</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Add Expense</h1>
          <p className="text-text-muted">Record a bill and split it among participants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary">
            <div className="flex items-start gap-3 mb-4">
              <Upload className="text-primary mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Receipt Scanner</h3>
                <p className="text-sm text-text-muted">
                  Upload a photo of your receipt for automatic amount detection
                </p>
              </div>
            </div>

            {!receiptImage ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    icon={Camera}
                    onClick={handleCameraCapture}
                    fullWidth
                  >
                    Take Photo
                  </Button>
                </div>

                {errors.receipt && (
                  <p className="text-sm text-error">{errors.receipt}</p>
                )}

                <div className="mt-4 p-3 bg-white rounded-lg border border-border">
                  <p className="text-xs text-text-muted">
                    <strong>Supported formats:</strong> JPG, PNG, HEIC, WebP (max 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    src={receiptImage}
                    alt="Receipt preview"
                    className="w-full h-64 object-contain bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-text-secondary" />
                  </button>
                </div>

                {isScanning && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border border-primary">
                    <Scan className="text-primary animate-pulse" size={24} />
                    <div>
                      <p className="font-medium text-text-primary">Scanning receipt...</p>
                      <p className="text-sm text-text-muted">Extracting expense details</p>
                    </div>
                  </div>
                )}

                {scanComplete && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-success">
                    <CheckCircle className="text-success" size={24} />
                    <div>
                      <p className="font-medium text-success">Scan complete!</p>
                      <p className="text-sm text-text-muted">Expense details have been filled automatically</p>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                >
                  Upload Different Receipt
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Receipt size={24} className="text-primary" />
              Expense Details
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Description"
                name="description"
                placeholder="e.g., Dinner at restaurant"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Total Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        errors.amount ? 'border-error' : 'border-border'
                      }`}
                      required
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-sm text-error">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Paid By
                </label>
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {event.participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users size={24} className="text-primary" />
              Who's Involved? ({selectedCount} selected)
            </h2>
            
            <div className="space-y-3 mb-6">
              {event.participants.map(participant => (
                <label
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedParticipants.has(participant.id)
                      ? 'border-primary bg-blue-50'
                      : 'border-border hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.has(participant.id)}
                    onChange={() => toggleParticipant(participant.id)}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{participant.name}</p>
                    <p className="text-sm text-text-muted">{participant.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            {errors.participants && (
              <p className="text-sm text-error mb-4">{errors.participants}</p>
            )}

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Split Type</h3>
              
              <div className="flex gap-4 mb-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="splitType"
                    value="selective"
                    checked={formData.splitType === 'selective'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all ${
                    formData.splitType === 'selective' 
                      ? 'border-primary bg-blue-50' 
                      : 'border-border hover:border-gray-300'
                  }`}>
                    <p className="font-medium text-text-primary mb-1">Equal Split</p>
                    <p className="text-sm text-text-muted">
                      ${equalShare} per person
                    </p>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="splitType"
                    value="custom"
                    checked={formData.splitType === 'custom'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all ${
                    formData.splitType === 'custom' 
                      ? 'border-primary bg-blue-50' 
                      : 'border-border hover:border-gray-300'
                  }`}>
                    <p className="font-medium text-text-primary mb-1">Custom Split</p>
                    <p className="text-sm text-text-muted">
                      Set individual amounts
                    </p>
                  </div>
                </label>
              </div>

              {formData.splitType === 'custom' && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-secondary mb-3">
                    Enter amount for each selected participant
                  </p>
                  {event.participants
                    .filter(p => selectedParticipants.has(p.id))
                    .map(participant => (
                      <div key={participant.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{participant.name}</p>
                        </div>
                        <div className="w-32">
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customShares[participant.id] || ''}
                              onChange={(e) => handleCustomShareChange(participant.id, e.target.value)}
                              className="w-full pl-7 pr-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  {errors.shares && (
                    <p className="text-sm text-error mt-2">{errors.shares}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/events/${eventId}/contacts`)}
              fullWidth
            >
              Back
            </Button>
            <Button
              type="submit"
              icon={ArrowRight}
              iconPosition="right"
              fullWidth
            >
              View Summary
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
