/**
 * Demo data and utilities for demo accounts
 * Provides mock data without requiring backend/database connection
 */

export const isDemoAccount = (userId) => {
  return userId && userId.startsWith('demo-');
};

// Mock events for all demo users
export const mockEvents = [
  {
    eventID: 'evt-001',
    name: 'Tech Conference 2026',
    description: 'Annual tech conference featuring industry leaders',
    category: 'Technology',
    eventStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    eventEnd: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Convention Center, Manila',
    capacity: 500,
    registered: 380,
    ticketPrice: 1500,
    image: 'https://images.unsplash.com/photo-1540575467063-178f50c2fe5e?w=500&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.5,
    ticketsSold: 380
  },
  {
    eventID: 'evt-002',
    name: 'Music Festival 2026',
    description: 'Summer music festival with top artists',
    category: 'Entertainment',
    eventStart: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    eventEnd: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Rizal Park, Manila',
    capacity: 2000,
    registered: 1200,
    ticketPrice: 2500,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.8,
    ticketsSold: 1200
  },
  {
    eventID: 'evt-003',
    name: 'Business Networking Breakfast',
    description: 'Connect with business professionals over breakfast',
    category: 'Business',
    eventStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    eventEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Manila Hotel, Manila',
    capacity: 150,
    registered: 145,
    ticketPrice: 800,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    status: 'AVAILABLE',
    rating: 4.2,
    ticketsSold: 145
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
