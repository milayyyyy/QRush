/**
 * Demo data and utilities for demo accounts
 * Provides mock data without requiring backend/database connection
 */

export const isDemoAccount = (userId) => {
  return userId && userId.startsWith('demo-');
};

// Local storage helpers for demo events
const DEMO_EVENTS_KEY = 'qrush_demo_events';

export const getDemoEvents = () => {
  try {
    // always reset storage to current mockEvents so previous demo events are removed
    localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(mockEvents));
    const raw = localStorage.getItem(DEMO_EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];
    // ensure each event has a title property for UI
    return events.map(e => ({
      ...e,
      title: e.title || e.name || '',
    }));
  } catch (e) {
    console.warn('Failed to parse demo events', e);
    return [];
  }
};

export const saveDemoEvents = (events) => {
  try {
    localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to save demo events', e);
  }
};

export const findDemoEventById = (id) => {
  return getDemoEvents().find(e => e.eventID === id);
};

export const upsertDemoEvent = (event) => {
  // ensure title exists
  event = {
    ...event,
    title: event.title || event.name || ''
  };

  const events = getDemoEvents();
  const idx = events.findIndex(e => e.eventID === event.eventID);
  if (idx >= 0) {
    events[idx] = event;
  } title: 'Midnight Groove: Live R&B x Afrobeat Experience',
    else {
    events.push(event);
  }
  saveDemoEvents(events);
};

// Mock events for all demo users (replace existing demo content)
export const mockEvents = [
  {
    eventID: 'demo-midnight-groove-001',
    name: 'Midnight Groove: Live R&B x Afrobeat Experience',
    description: 'Midnight Groove is a live music event bringing together the smooth sounds of R&B and the vibrant rhythm of Afrobeat. This event features talented local artists delivering soulful vocals, engaging stage presence, and immersive musical performances.\n\nAttendees will enjoy:\n\n• Live performances from rising R&B and Afrobeat artists\n• Chill and intimate atmosphere with immersive sound\n• Networking opportunities with music lovers and creatives\n• Exclusive live debut of original songs\n\nWhether you\'re a fan of smooth R&B melodies or energetic Afrobeat rhythms, Midnight Groove offers a unique experience you won\'t forget.\n\nPerfect for music lovers, creators, and anyone who wants to enjoy a night of pure vibe and sound.',
    category: 'Music',
    eventStart: '2026-03-15T19:00:00',
    eventEnd: '2026-03-15T23:00:00',
    location: 'Pulse Lounge Cebu, Mango Avenue, Cebu City, Cebu, 6000, Philippines',
    capacity: 100,
    registered: 0,
    ticketPrice: 100,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    status: 'AVAILABLE',
    rating: null,
    ticketsSold: 0
  }
];

// Mock organizer dashboard
export const mockOrganizerDashboard = {
  totalEvents: 5,
  activeEvents: 3,
  totalRevenue: 125000,
  totalAttendees: 2500,
  events: mockEvents.slice(0, 2),
  revenueChartData: [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 22000 },
    { month: 'Mar', revenue: 18500 },
    { month: 'Apr', revenue: 31000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 13500 }
  ],
  attendeeGrowthData: [
    { month: 'Jan', attendees: 250 },
    { month: 'Feb', attendees: 420 },
    { month: 'Mar', attendees: 380 },
    { month: 'Apr', attendees: 650 },
    { month: 'May', attendees: 580 },
    { month: 'Jun', revenue: 350 }
  ]
};

// Mock attendee dashboard
export const mockAttendeeDashboard = {
  upcomingTickets: [
    {
      ticketID: 'TCK-001',
      eventName: 'Tech Conference 2026',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Convention Center, Manila',
      category: 'Technology',
      seatNumber: 'A-105',
      ticketType: 'VIP Pass',
      status: 'VALID',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCK-001'
    },
    {
      ticketID: 'TCK-002',
      eventName: 'Music Festival 2026',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Rizal Park, Manila',
      category: 'Entertainment',
      seatNumber: 'GA-256',
      ticketType: 'General Admission',
      status: 'VALID',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCK-002'
    }
  ],
  pastTickets: [
    {
      ticketID: 'TCK-000',
      eventName: 'Web Development Summit 2025',
      eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'SMX Convention, Manila',
      category: 'Technology',
      seatNumber: 'B-210',
      ticketType: 'Standard Pass',
      status: 'USED',
      rating: 4.5
    }
  ],
  eventHistory: [
    {
      eventID: 'evt-old-001',
      eventName: 'Web Development Summit 2025',
      eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      attended: true,
      rating: 4.5,
      feedback: 'Great event with excellent speakers!'
    }
  ],
  totalSpent: 7800,
  eventsAttended: 8
};

// Mock staff dashboard
export const mockStaffDashboard = {
  eventName: 'Tech Conference 2026',
  totalTickets: 500,
  checkedIn: 280,
  pending: 100,
  invalid: 20,
  recentScans: [
    {
      ticketID: 'TCK-001',
      attendeeName: 'John Doe',
      scanTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'CHECKED_IN',
      seatNumber: 'A-105'
    },
    {
      ticketID: 'TCK-002',
      attendeeName: 'Jane Smith',
      scanTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'CHECKED_IN',
      seatNumber: 'A-106'
    },
    {
      ticketID: 'TCK-003',
      attendeeName: 'Bob Johnson',
      scanTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'CHECKED_IN',
      seatNumber: 'B-201'
    }
  ],
  checkInRate: 56,
  capacity: 500
};

// Mock notifications
export const mockNotifications = [
  {
    id: 'notif-001',
    title: 'Event Reminder',
    message: 'Tech Conference 2026 starts in 7 days',
    type: 'REMINDER',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-002',
    title: 'Ticket Purchased',
    message: 'Your ticket for Music Festival 2026 is confirmed',
    type: 'PURCHASE',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];
