import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { getDemoEvents } from '../lib/demoData';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await apiService.getEvents();
        const normalised = data.map((event) => ({
          ...event,
          registered: event.registered ?? 0,
          rating: event.rating ?? null,
          image: event.image ?? '',
        }));
        // include locally stored demo events
        const demoEvents = getDemoEvents().map((event) => ({
          ...event,
          registered: event.registered ?? 0,
          rating: event.rating ?? null,
          image: event.image ?? '',
        }));
        setEvents([...normalised, ...demoEvents]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filterEvents = useCallback((searchTerm, category, includeCancelled = false) => {
    return events.filter(event => {
      // Filter out cancelled events by default
      if (!includeCancelled && event.status === 'CANCELLED') {
        return false;
      }
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || event.category === category;
      return matchesSearch && matchesCategory && event.status === 'AVAILABLE';
    });
  }, [events]);

  const getPastEvents = useCallback((searchTerm, category) => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || event.category === category;
      return matchesSearch && matchesCategory && event.status === 'ENDED';
    });
  }, [events]);

  return { events, loading, error, filterEvents, getPastEvents };
};
