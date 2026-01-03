import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Participant, Expense } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  user: User | null;
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, emailOrPhone: string, password: string) => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'createdBy' | 'participants' | 'expenses'>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  addParticipant: (eventId: string, participant: Omit<Participant, 'id'>) => Promise<void>;
  removeParticipant: (eventId: string, participantId: string) => Promise<void>;
  addExpense: (eventId: string, expense: Omit<Expense, 'id' | 'eventId' | 'date'>) => Promise<void>;
  setCurrentEvent: (eventId: string | null) => void;
  refreshEvents: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEventState] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const normalizePhone = (phone: string) => {
    // Remove spaces and dashes
    let normalized = phone.replace(/[\s-]/g, '');
    
    // If starts with 0, replace with +60
    if (normalized.startsWith('0')) {
      normalized = '+60' + normalized.substring(1);
    }
    // If starts with 60 but not +60, add +
    else if (normalized.startsWith('60') && !normalized.startsWith('+60')) {
      normalized = '+' + normalized;
    }
    // If doesn't start with +, assume Malaysia and add +60
    else if (!normalized.startsWith('+')) {
      normalized = '+60' + normalized;
    }
    
    return normalized;
  };

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        return;
      }

      if (!eventsData) {
        setEvents([]);
        return;
      }

      const eventsWithDetails = await Promise.all(
        eventsData.map(async (event) => {
          const { data: participantsData } = await supabase
            .from('participants')
            .select('*')
            .eq('event_id', event.id);

          const { data: expensesData } = await supabase
            .from('expenses')
            .select('*')
            .eq('event_id', event.id)
            .order('date', { ascending: false });

          const participants: Participant[] = (participantsData || []).map(p => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            role: p.role as 'organizer' | 'participant',
            avatar: p.avatar || undefined,
            paymentMethod: {
              tngNumber: p.tng_number || undefined,
              duitnowId: p.duitnow_id || undefined,
              qrCode: p.qr_code || undefined,
            },
          }));

          const expenses: Expense[] = (expensesData || []).map(e => ({
            id: e.id,
            eventId: e.event_id,
            description: e.description,
            amount: e.amount,
            category: e.category,
            paidBy: e.paid_by,
            splitType: e.split_type as 'equal' | 'custom' | 'selective',
            shares: e.shares as Record<string, number>,
            selectedParticipants: e.selected_participants as string[] | undefined,
            receipt: e.receipt || undefined,
            date: new Date(e.date),
          }));

          return {
            id: event.id,
            name: event.name,
            description: event.description || undefined,
            date: new Date(event.date),
            image: event.image || undefined,
            participants,
            expenses,
            createdBy: event.created_by,
            createdAt: new Date(event.created_at),
          };
        })
      );

      setEvents(eventsWithDetails);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (!initialized) {
      const initializeAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userData) {
              setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || undefined,
                avatar: userData.avatar || undefined,
              });
            }
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };

      initializeAuth();
    }
  }, [initialized]);

  useEffect(() => {
    if (user && initialized) {
      fetchEvents();
    }
  }, [user, initialized]);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      const isEmail = isValidEmail(emailOrPhone);
      let loginIdentifier = emailOrPhone;

      // If it's a phone number, normalize it
      if (!isEmail) {
        loginIdentifier = normalizePhone(emailOrPhone);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: isEmail ? loginIdentifier : `${loginIdentifier}@tmimi.app`,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email/phone or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address');
        }
        
        throw new Error(error.message || 'Login failed');
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
        throw new Error('Failed to fetch user data');
      }

      if (!userData) {
        throw new Error('User profile not found');
      }

      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        avatar: userData.avatar || undefined,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setEvents([]);
      setCurrentEventState(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (name: string, emailOrPhone: string, password: string) => {
    try {
      // Validate password requirements
      const passwordRequirements = [
        { test: password.length >= 8, message: 'Password must be at least 8 characters' },
        { test: /[A-Z]/.test(password), message: 'Password must contain an uppercase letter' },
        { test: /[a-z]/.test(password), message: 'Password must contain a lowercase letter' },
        { test: /[0-9]/.test(password), message: 'Password must contain a number' },
        { test: /[!@#$%^&*]/.test(password), message: 'Password must contain a special character (!@#$%^&*)' },
      ];

      const failedRequirement = passwordRequirements.find(req => !req.test);
      if (failedRequirement) {
        throw new Error(failedRequirement.message);
      }

      const isEmail = isValidEmail(emailOrPhone);
      let email = emailOrPhone;
      let phone = undefined;

      // If it's a phone number, create a synthetic email and store the phone
      if (!isEmail) {
        phone = normalizePhone(emailOrPhone);
        email = `${phone}@tmimi.app`;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            name,
            phone,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('already registered')) {
          throw new Error('This email/phone is already registered');
        } else if (error.message.includes('Password')) {
          throw new Error(error.message);
        }
        
        throw new Error(error.message || 'Registration failed');
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email: isEmail ? email : undefined,
          phone: phone,
        });

      if (insertError) {
        console.error('User insert error:', insertError);
        throw new Error('Failed to create user profile');
      }

      setUser({
        id: data.user.id,
        name,
        email: isEmail ? email : undefined,
        phone: phone,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'createdBy' | 'participants' | 'expenses'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          name: eventData.name,
          description: eventData.description || null,
          date: eventData.date.toISOString(),
          image: eventData.image || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Event creation error:', error);
        throw new Error('Failed to create event');
      }

      await fetchEvents();
      
      return data.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: updates.name,
          description: updates.description || null,
          date: updates.date?.toISOString(),
          image: updates.image || null,
        })
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const addParticipant = async (eventId: string, participant: Omit<Participant, 'id'>) => {
    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          event_id: eventId,
          name: participant.name,
          phone: participant.phone,
          role: participant.role,
          avatar: participant.avatar || null,
          tng_number: participant.paymentMethod?.tngNumber || null,
          duitnow_id: participant.paymentMethod?.duitnowId || null,
          qr_code: participant.paymentMethod?.qrCode || null,
        });

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  };

  const removeParticipant = async (eventId: string, participantId: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  };

  const addExpense = async (eventId: string, expenseData: Omit<Expense, 'id' | 'eventId' | 'date'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          event_id: eventId,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          paid_by: expenseData.paidBy,
          split_type: expenseData.splitType,
          shares: expenseData.shares,
          selected_participants: expenseData.selectedParticipants || null,
          receipt: expenseData.receipt || null,
        });

      if (error) throw error;

      await fetchEvents();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const setCurrentEvent = (eventId: string | null) => {
    if (eventId) {
      const event = events.find(e => e.id === eventId);
      setCurrentEventState(event || null);
    } else {
      setCurrentEventState(null);
    }
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  return (
    <AppContext.Provider value={{
      user,
      events,
      currentEvent,
      loading,
      login,
      logout,
      register,
      createEvent,
      updateEvent,
      addParticipant,
      removeParticipant,
      addExpense,
      setCurrentEvent,
      refreshEvents,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
