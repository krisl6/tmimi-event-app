import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, TrendingUp, Users, DollarSign, CheckCircle, Receipt as ReceiptIcon, Share2, Copy, Check, X, Smartphone, CreditCard, QrCode, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import type { Settlement } from '../types';

export const ExpenseSummary: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useApp();
  
  const event = events.find(e => e.id === eventId);
  const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{ participantId: string; method: 'tng' | 'duitnow' | 'qr' } | null>(null);

  if (!event) {
    return <div>Event not found</div>;
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

  // Category breakdown
  const categoryData = event.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    amount: value,
  }));

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Settlement suggestions with payment methods
  const settlements: Settlement[] = [];
  const debtors = Object.entries(balances).filter(([, bal]) => bal < 0).map(([id, bal]) => ({ id, amount: -bal }));
  const creditors = Object.entries(balances).filter(([, bal]) => bal > 0).map(([id, bal]) => ({ id, amount: bal }));

  debtors.forEach(debtor => {
    let remaining = debtor.amount;
    creditors.forEach(creditor => {
      if (remaining > 0 && creditor.amount > 0) {
        const payment = Math.min(remaining, creditor.amount);
        const creditorParticipant = event.participants.find(p => p.id === creditor.id);
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: payment,
          paymentMethod: creditorParticipant?.paymentMethod,
        });
        remaining -= payment;
        creditor.amount -= payment;
      }
    });
  });

  const shareableLink = `${window.location.origin}/shared/events/${eventId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowPaymentMethod = (participantId: string, method: 'tng' | 'duitnow' | 'qr') => {
    setSelectedPaymentMethod({ participantId, method });
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Expense Summary</h1>
            <p className="text-text-muted">Overview of all expenses for "{event.name}"</p>
          </div>
          <Button
            variant="outline"
            icon={Share2}
            onClick={() => setShowShareModal(true)}
          >
            Share Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Total Expenses</p>
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
                <p className="text-sm text-text-muted mb-1">Total Transactions</p>
                <p className="text-3xl font-bold text-text-primary">{event.expenses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Category Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expense Details with Receipts */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Expense Details</h2>
          <div className="space-y-3">
            {event.expenses.map((expense) => {
              const payer = event.participants.find(p => p.id === expense.paidBy);
              const involvedParticipants = expense.selectedParticipants 
                ? event.participants.filter(p => expense.selectedParticipants!.includes(p.id))
                : event.participants;
              
              return (
                <div
                  key={expense.id}
                  className="p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary">
                          {expense.description}
                        </h3>
                        {expense.receipt && (
                          <button
                            onClick={() => setSelectedReceipt(expense.receipt!)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="View receipt"
                          >
                            <ReceiptIcon size={16} className="text-primary" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted mb-2">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>Paid by {payer?.name}</span>
                        <span>•</span>
                        <span>{format(expense.date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {involvedParticipants.map(p => (
                          <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            <Users size={12} />
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Settlement Suggestions - Enhanced */}
        {settlements.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Who Owes Who</h2>
            <p className="text-sm text-text-muted mb-6">
              Here's how to settle up. Click on payment methods to view details.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settlements.map((settlement, index) => {
                const fromPerson = event.participants.find(p => p.id === settlement.from);
                const toPerson = event.participants.find(p => p.id === settlement.to);
                
                return (
                  <div key={index} className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-primary shadow-sm">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center font-semibold text-sm">
                            {fromPerson?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">{fromPerson?.name}</p>
                            <p className="text-xs text-text-muted">owes</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center px-4 py-2 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-primary">${settlement.amount.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-text-primary">{toPerson?.name}</p>
                            <p className="text-xs text-text-muted">receives</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center font-semibold text-sm">
                            {toPerson?.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {settlement.paymentMethod && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs font-medium text-text-secondary mb-2">Payment Methods:</p>
                        <div className="flex flex-wrap gap-2">
                          {settlement.paymentMethod.tngNumber && (
                            <button
                              onClick={() => handleShowPaymentMethod(settlement.to, 'tng')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-primary text-primary rounded-lg text-sm hover:bg-blue-50 transition-colors"
                            >
                              <Smartphone size={14} />
                              Touch 'n Go
                            </button>
                          )}
                          {settlement.paymentMethod.duitnowId && (
                            <button
                              onClick={() => handleShowPaymentMethod(settlement.to, 'duitnow')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-success text-success rounded-lg text-sm hover:bg-green-50 transition-colors"
                            >
                              <CreditCard size={14} />
                              DuitNow
                            </button>
                          )}
                          {settlement.paymentMethod.qrCode && (
                            <button
                              onClick={() => handleShowPaymentMethod(settlement.to, 'qr')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-purple-600 text-purple-600 rounded-lg text-sm hover:bg-purple-50 transition-colors"
                            >
                              <QrCode size={14} />
                              QR Code
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Balance Overview */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Individual Balances</h2>
          <div className="space-y-3">
            {event.participants.map(participant => {
              const balance = balances[participant.id];
              const isPositive = balance > 0;
              const isZero = Math.abs(balance) < 0.01;
              
              return (
                <div key={participant.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-text-primary">{participant.name}</p>
                  </div>
                  <div className="text-right">
                    {isZero ? (
                      <span className="text-text-muted flex items-center gap-2">
                        <CheckCircle size={18} className="text-success" />
                        Settled up
                      </span>
                    ) : (
                      <>
                        <p className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
                          {isPositive ? '+' : ''}${balance.toFixed(2)}
                        </p>
                        <p className="text-sm text-text-muted">
                          {isPositive ? 'is owed' : 'owes'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Export Options */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Export & Share</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" icon={Download}>
              Export as PDF
            </Button>
            <Button variant="outline" icon={Download}>
              Export as CSV
            </Button>
          </div>
        </Card>

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/events/${eventId}`)}
            fullWidth
          >
            View Event Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/events/${eventId}/bill`)}
            fullWidth
          >
            Add Another Expense
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X size={24} className="text-text-secondary" />
            </button>
            <img
              src={selectedReceipt}
              alt="Receipt"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">Share Report</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            
            <p className="text-sm text-text-muted mb-4">
              Share this expense report with participants. Anyone with the link can view the summary.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-medium text-text-secondary mb-2">Shareable Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-border rounded text-sm text-text-primary"
                />
                <Button
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopyLink}
                  variant={copied ? "outline" : "default"}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowShareModal(false)}
                fullWidth
              >
                Close
              </Button>
              <Button
                icon={ExternalLink}
                onClick={() => window.open(shareableLink, '_blank')}
                fullWidth
              >
                Open Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {selectedPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {(() => {
              const participant = event.participants.find(p => p.id === selectedPaymentMethod.participantId);
              const method = selectedPaymentMethod.method;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Payment Details</h3>
                    <button
                      onClick={() => setSelectedPaymentMethod(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-text-secondary" />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                      {participant?.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-text-primary text-lg">{participant?.name}</p>
                  </div>

                  {method === 'tng' && participant?.paymentMethod?.tngNumber && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="text-primary" size={20} />
                        <p className="font-semibold text-text-primary">Touch 'n Go</p>
                      </div>
                      <p className="text-2xl font-mono font-bold text-primary">
                        {participant.paymentMethod.tngNumber}
                      </p>
                    </div>
                  )}

                  {method === 'duitnow' && participant?.paymentMethod?.duitnowId && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="text-success" size={20} />
                        <p className="font-semibold text-text-primary">DuitNow</p>
                      </div>
                      <p className="text-lg font-mono font-bold text-success break-all">
                        {participant.paymentMethod.duitnowId}
                      </p>
                    </div>
                  )}

                  {method === 'qr' && participant?.paymentMethod?.qrCode && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="text-purple-600" size={20} />
                        <p className="font-semibold text-text-primary">QR Code</p>
                      </div>
                      <img
                        src={participant.paymentMethod.qrCode}
                        alt="Payment QR Code"
                        className="w-full max-w-xs mx-auto rounded-lg border-2 border-purple-600"
                      />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedPaymentMethod(null)}
                    fullWidth
                  >
                    Close
                  </Button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
