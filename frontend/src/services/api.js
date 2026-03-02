/**
 * API Service — Supabase direct client
 * All data operations go through the Supabase JS SDK.
 */
import { supabase } from '../config/supabase';

// ─── Field mappers ────────────────────────────────────────────────────────────

const mapEvent = (e) => {
  if (!e) return null;
  return {
    eventID: String(e.event_id),
    name: e.name,
    description: e.description,
    location: e.location,
    category: e.category,
    startDate: e.start_date,
    endDate: e.end_date,
    ticketPrice: Number(e.ticket_price ?? 0),
    capacity: Number(e.capacity ?? 0),
    organizer: e.organizer,
    organizerDisplayName: e.organizer_display_name,
    organizerEmail: e.organizer_email,
    organizerPhone: e.organizer_phone,
    image: e.image_data,
    features: e.features,
    agenda: e.agenda,
    ticketTypes: e.ticket_types,
    viewCount: e.view_count ?? 0,
    ticketsSold: e.tickets_sold ?? 0,
    registered: e.tickets_sold ?? 0,
    status: e.status,
    cancellationReason: e.cancellation_reason,
    cancelledAt: e.cancelled_at,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    rating: null,
  };
};

const mapTicket = (t) => {
  if (!t) return null;
  return {
    ticketId: String(t.ticket_id),
    ticketID: String(t.ticket_id),
    userId: t.user_id,
    eventId: String(t.event_id),
    qrCode: t.qr_code,
    price: t.price,
    purchaseDate: t.purchase_date,
    ticketType: t.ticket_type,
    status: t.status,
    seatNumber: t.seat_number,
    checkInTime: t.check_in_time,
    // joined event fields
    eventTitle: t.events?.name,
    eventName: t.events?.name,
    eventStart: t.events?.start_date,
    location: t.events?.location,
    category: t.events?.category,
    image: t.events?.image_data,
    eventStatus: t.events?.status,
  };
};

const mapUser = (u) => {
  if (!u) return null;
  return {
    id: u.user_id,
    email: u.email,
    name: u.name,
    role: (u.role || 'attendee').toLowerCase(),
    contact: u.contact || '',
    birthdate: u.birthdate || '',
    gender: u.gender || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
  };
};

const mapNotification = (n) => {
  if (!n) return null;
  return {
    id: n.notification_id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: (n.type || 'info').toLowerCase(),
    isRead: n.is_read,
    readAt: n.read_at,
    createdAt: n.created_at,
  };
};

const throwIf = (error) => {
  if (error) throw new Error(error.message || 'Database error');
};

// ─── ApiService ───────────────────────────────────────────────────────────────

class ApiService {

  // ── Auth ──────────────────────────────────────────────────────────────────

  async signup({ name, email, password, role, contact, birthdate, gender }) {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: role.toUpperCase(), contact } },
    });
    throwIf(authError);

    // Insert profile row
    const { error: dbError } = await supabase.from('users').insert([{
      name,
      email,
      password: '(supabase-auth)',
      role: role.toUpperCase(),
      contact: contact || null,
      birthdate: birthdate || null,
      gender: gender || null,
    }]);
    if (dbError) console.warn('Profile insert failed:', dbError.message);

    return { message: 'Account created! Check your email to confirm, then sign in.' };
  }

  async login({ email, password }) {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    throwIf(error);

    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userRow) return mapUser(userRow);

    // Fallback to auth metadata
    const meta = data.user.user_metadata || {};
    return {
      id: data.user.id,
      email: data.user.email,
      name: meta.name || email.split('@')[0],
      role: (meta.role || 'attendee').toLowerCase(),
      contact: meta.contact || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
  }

  isSupabaseAvailable() {
    return !!supabase;
  }

  async getSupabaseSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  }

  async supabaseSignout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    throwIf(error);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    throwIf(error);
    return mapUser(data);
  }

  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        contact: profileData.contact || null,
        birthdate: profileData.birthdate || null,
        gender: profileData.gender || null,
      })
      .eq('user_id', userId)
      .select()
      .single();
    throwIf(error);
    return mapUser(data);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    throwIf(error);
    return (data || []).map(mapEvent);
  }

  async getEvent(eventId, options = {}) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', Number(eventId))
      .single();
    throwIf(error);
    return mapEvent(data);
  }

  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        name: eventData.name,
        description: eventData.description || null,
        location: eventData.location,
        category: eventData.category || null,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        ticket_price: eventData.ticketPrice ?? 0,
        capacity: eventData.capacity ?? 0,
        organizer: eventData.organizer,
        organizer_display_name: eventData.organizerDisplayName || null,
        organizer_email: eventData.organizerEmail || null,
        organizer_phone: eventData.organizerPhone || null,
        image_data: eventData.image || null,
        features: eventData.features || null,
        agenda: eventData.agenda || null,
        ticket_types: eventData.ticketTypes || null,
        status: 'AVAILABLE',
      }])
      .select()
      .single();
    throwIf(error);
    return mapEvent(data);
  }

  async updateEvent(eventId, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update({
        name: eventData.name,
        description: eventData.description || null,
        location: eventData.location,
        category: eventData.category || null,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        ticket_price: eventData.ticketPrice ?? 0,
        capacity: eventData.capacity ?? 0,
        organizer: eventData.organizer,
        organizer_display_name: eventData.organizerDisplayName || null,
        organizer_email: eventData.organizerEmail || null,
        organizer_phone: eventData.organizerPhone || null,
        image_data: eventData.image || null,
        features: eventData.features || null,
        agenda: eventData.agenda || null,
        ticket_types: eventData.ticketTypes || null,
      })
      .eq('event_id', Number(eventId))
      .select()
      .single();
    throwIf(error);
    return mapEvent(data);
  }

  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', Number(eventId));
    throwIf(error);
    return { success: true };
  }

  async cancelEvent(eventId, reason) {
    const { data, error } = await supabase
      .from('events')
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
      })
      .eq('event_id', Number(eventId))
      .select()
      .single();
    throwIf(error);

    // Count & refund valid tickets
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', Number(eventId))
      .in('status', ['VALID', 'PENDING']);

    await supabase
      .from('tickets')
      .update({ status: 'REFUNDED' })
      .eq('event_id', Number(eventId))
      .in('status', ['VALID', 'PENDING']);

    return {
      success: true,
      message: 'Event cancelled successfully',
      ticketsRefunded: count || 0,
      totalRefundAmount: (count || 0) * Number(data?.ticket_price ?? 0),
    };
  }

  async canDeleteEvent(eventId) {
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', Number(eventId))
      .in('status', ['VALID', 'USED']);
    return { canDelete: (count || 0) === 0 };
  }

  async trackEventView(eventId, options = {}) {
    const { userId = null, userRole = null } = options;
    await supabase.from('event_views').insert([{
      event_id: Number(eventId),
      user_id: userId ? Number(userId) : null,
      user_role: userRole || null,
    }]).maybeSingle().catch(() => null);
    return null;
  }

  // ── Tickets ───────────────────────────────────────────────────────────────

  async bookTickets({ userId, eventId, quantity, ticketType, ticketPrice, paymentMethod }) {
    const rows = Array.from({ length: quantity }, () => ({
      user_id: Number(userId),
      event_id: Number(eventId),
      qr_code: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      price: ticketPrice ?? 0,
      ticket_type: ticketType || 'Regular',
      status: 'VALID',
      purchase_date: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('tickets').insert(rows).select();
    throwIf(error);

    // Update tickets_sold count
    await supabase
      .from('events')
      .update({ tickets_sold: supabase.rpc ? undefined : undefined })
      .eq('event_id', Number(eventId))
      .maybeSingle()
      .catch(() => null);

    // Use raw increment via RPC if available, otherwise manual
    const { data: evt } = await supabase
      .from('events').select('tickets_sold').eq('event_id', Number(eventId)).single().catch(() => ({ data: null }));
    if (evt) {
      await supabase.from('events')
        .update({ tickets_sold: (evt.tickets_sold || 0) + quantity })
        .eq('event_id', Number(eventId))
        .catch(() => null);
    }

    return data;
  }

  async getTicket(ticketId) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('ticket_id', Number(ticketId))
      .single();
    throwIf(error);
    return mapTicket(data);
  }

  async scanTicket({ qrCode, eventId, staffId }) {
    let query;
    // Support display ticket number format: TCK-000001
    if (qrCode && /^TCK-\d+$/i.test(qrCode.trim())) {
      const ticketId = parseInt(qrCode.trim().replace(/^TCK-/i, ''), 10);
      query = supabase.from('tickets').select('*').eq('ticket_id', ticketId);
    } else {
      query = supabase.from('tickets').select('*').eq('qr_code', qrCode.trim());
      if (eventId && !isNaN(Number(eventId))) {
        query = query.eq('event_id', Number(eventId));
      }
    }
    const { data: ticket, error: findError } = await query.maybeSingle();

    if (findError) throw new Error(`Lookup failed: ${findError.message}`);
    if (!ticket) throw new Error('Ticket not found');

    // Already used — return duplicate status instead of throwing so UI can handle gracefully
    if (ticket.status === 'USED') {
      return {
        success: false,
        status: 'duplicate',
        message: 'Ticket already checked in.',
        ticket: mapTicket(ticket),
      };
    }

    // Allow scan for any ticket status VALID (regardless of event date)
    if (ticket.status !== 'VALID') {
      throw new Error(`Ticket cannot be scanned (status: ${ticket.status})`);
    }

    const { data: updated, error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'USED', check_in_time: new Date().toISOString() })
      .eq('ticket_id', ticket.ticket_id)
      .select()
      .single();
    throwIf(updateError);

    await supabase.from('attendance_logs').insert([{
      ticket_id: ticket.ticket_id,
      user_id: ticket.user_id,
      event_id: ticket.event_id,
      staff_user_id: staffId ? Number(staffId) : null,
      verification_status: 'CHECKED_IN',
      check_in_time: new Date().toISOString(),
      scan_time: new Date().toISOString(),
    }]).catch(() => null);

    return {
      success: true,
      status: 'valid',
      message: 'Ticket verified successfully.',
      ticket: mapTicket(updated),
    };
  }

  async manualVerifyTicket({ ticketNumber, eventId, staffId }) {
    return this.scanTicket({ qrCode: ticketNumber, eventId: Number(eventId), staffId });
  }

  async bulkCheckIn({ ticketNumbers, eventId, staffId }) {
    const results = await Promise.allSettled(
      ticketNumbers.map((num) => this.scanTicket({ qrCode: num, eventId, staffId }))
    );
    return results.map((r, i) => ({
      ticketNumber: ticketNumbers[i],
      success: r.status === 'fulfilled',
      message: r.status === 'fulfilled' ? 'Checked in' : (r.reason?.message || 'Failed'),
    }));
  }

  // ── Dashboards ────────────────────────────────────────────────────────────

  async getAttendeeDashboard(userId) {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('user_id', Number(userId))
      .order('purchase_date', { ascending: false });
    throwIf(error);

    const now = new Date();
    const upcomingTickets = [];
    const pastTickets = [];

    for (const t of tickets || []) {
      const mapped = mapTicket(t);
      const eventEnd = t.events?.end_date ? new Date(t.events.end_date) : null;
      if (eventEnd && eventEnd < now) {
        pastTickets.push(mapped);
      } else {
        upcomingTickets.push(mapped);
      }
    }

    return {
      upcomingTickets,
      pastTickets,
      eventHistory: pastTickets,
      totalSpent: (tickets || []).reduce((s, t) => s + Number(t.price ?? 0), 0),
      eventsAttended: pastTickets.length,
    };
  }

  async getOrganizerDashboard(userId) {
    // Resolve organizer's email to match events
    const { data: userRow } = await supabase
      .from('users').select('email').eq('user_id', Number(userId)).maybeSingle();

    let query = supabase.from('events').select('*, tickets(ticket_id, status, price)');
    if (userRow?.email) {
      query = query.eq('organizer_email', userRow.email);
    }

    const { data: events, error } = await query.order('start_date', { ascending: false });
    throwIf(error);

    const mapped = (events || []).map((e) => {
      const soldTickets = (e.tickets || []).filter((t) =>
        ['VALID', 'USED'].includes(t.status)
      );
      const ticketsSold = soldTickets.length;
      const revenue = soldTickets.reduce((s, t) => s + Number(t.price ?? 0), 0);
      return { ...mapEvent(e), eventId: String(e.event_id), ticketsSold, revenue, views: e.view_count || 0 };
    });

    const totalRevenue = mapped.reduce((s, e) => s + (e.revenue || 0), 0);
    const totalTicketsSold = mapped.reduce((s, e) => s + (e.ticketsSold || 0), 0);

    return {
      events: mapped,
      totalEvents: mapped.length,
      activeEvents: mapped.filter((e) => e.status === 'AVAILABLE').length,
      totalRevenue,
      totalAttendees: totalTicketsSold,
      totalTicketsSold,
      averageAttendance: mapped.length
        ? Math.round(
            mapped.reduce((s, e) => s + Math.min((e.ticketsSold / Math.max(e.capacity, 1)) * 100, 100), 0) /
              mapped.length
          )
        : 0,
    };
  }

  async getStaffDashboard(eventId) {
    const { data: event, error: evtErr } = await supabase
      .from('events').select('*').eq('event_id', Number(eventId)).single();
    throwIf(evtErr);

    const { data: tickets, error: tickErr } = await supabase
      .from('tickets').select('*').eq('event_id', Number(eventId));
    throwIf(tickErr);

    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('*, tickets(qr_code, ticket_type, seat_number), users(name)')
      .eq('event_id', Number(eventId))
      .order('check_in_time', { ascending: false })
      .limit(20);

    const total = tickets?.length || 0;
    const checkedIn = tickets?.filter((t) => t.status === 'USED').length || 0;
    const pending = tickets?.filter((t) => t.status === 'VALID').length || 0;
    const invalid = tickets?.filter((t) => ['CANCELLED', 'EXPIRED', 'REFUNDED'].includes(t.status)).length || 0;

    return {
      eventName: event?.name || '',
      totalTickets: total,
      checkedIn,
      pending,
      invalid,
      recentScans: (logs || []).map((l) => ({
        ticketID: l.tickets?.qr_code || String(l.ticket_id),
        attendeeName: l.users?.name || 'Unknown',
        scanTime: l.scan_time || l.check_in_time,
        status: l.verification_status === 'CHECKED_IN' ? 'CHECKED_IN' : 'INVALID',
        seatNumber: l.tickets?.seat_number || '',
      })),
    };
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', Number(userId))
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data || []).map(mapNotification);
  }

  async getUnreadNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', Number(userId))
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data || []).map(mapNotification);
  }

  async getUnreadNotificationCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', Number(userId))
      .eq('is_read', false);
    throwIf(error);
    return { count: count || 0 };
  }

  async markNotificationAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('notification_id', Number(notificationId))
      .select()
      .single();
    throwIf(error);
    return mapNotification(data);
  }

  async markAllNotificationsAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', Number(userId))
      .eq('is_read', false);
    throwIf(error);
    return { success: true };
  }

  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notification_id', Number(notificationId));
    throwIf(error);
    return { success: true };
  }

  async deleteAllNotifications(userId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', Number(userId));
    throwIf(error);
    return { success: true };
  }

  // ── Attendance Logs ───────────────────────────────────────────────────────

  async getAttendanceLogs() {
    const { data, error } = await supabase.from('attendance_logs').select('*');
    throwIf(error);
    return data || [];
  }

  async getAttendanceLogsByUser(userId) {
    const { data, error } = await supabase
      .from('attendance_logs').select('*').eq('user_id', Number(userId));
    throwIf(error);
    return data || [];
  }

  async getAttendanceLogsByEvent(eventId) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('event_id', Number(eventId))
      .order('check_in_time', { ascending: false });
    throwIf(error);
    return data || [];
  }

  async getRecentAttendanceLogsByEvent(eventId) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('event_id', Number(eventId))
      .order('check_in_time', { ascending: false })
      .limit(50);
    throwIf(error);
    return data || [];
  }

  async getAttendanceStatsByEvent(eventId) {
    const { data, error } = await supabase
      .from('attendance_logs').select('*').eq('event_id', Number(eventId));
    throwIf(error);
    const logs = data || [];
    return {
      totalLogs: logs.length,
      checkInCount: logs.filter((l) => l.verification_status === 'CHECKED_IN').length,
    };
  }
}

export const apiService = new ApiService();

