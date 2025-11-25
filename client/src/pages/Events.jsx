import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { Calendar, MapPin, Clock, Users, Search, Filter, Zap, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import ScrollReveal from '../hooks/useScrollAnimation';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getAll();
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      // Date filter for calendar view
      if (viewMode === 'calendar' && selectedDate) {
        const eventDate = new Date(event.event_date);
        if (eventDate.toDateString() !== selectedDate.toDateString()) {
          return false;
        }
      }

      // Search filter
      const matchesSearch = !searchTerm ||
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const eventDate = new Date(event.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isUpcoming = eventDate >= today;
      const isPast = eventDate < today;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'upcoming' && isUpcoming) ||
        (filterStatus === 'past' && isPast);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.event_date) - new Date(b.event_date);
      } else if (sortBy === 'date-desc') {
        return new Date(b.event_date) - new Date(a.event_date);
      } else if (sortBy === 'venue') {
        return (a.venue_name || '').localeCompare(b.venue_name || '');
      }
      return 0;
    });

  // Get counts for filter badges
  const upcomingCount = events.filter(e => new Date(e.event_date) >= new Date()).length;
  const pastCount = events.filter(e => new Date(e.event_date) < new Date()).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const hasEventsOnDate = (date) => {
    return getEventsForDate(date).length > 0;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-r from-brit-navy to-brit-blue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Events</h1>
            <p className="text-xl text-gray-200">Loading amazing events...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card bg-gray-900 animate-pulse">
                <div className="bg-gray-700 h-48 -mt-6 -mx-6 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="card max-w-md text-center bg-gray-900">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-brit-red">Oops!</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <button onClick={loadEvents} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <ScrollReveal animation="fade-down">
        <section className="hero-section" style={{
          background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)',
          minHeight: '50vh'
        }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">Our Events</h1>
            <p className="hero-subtitle">Quiz nights, race nights, and special events across the North East</p>
          </div>
        </section>
      </ScrollReveal>

      {/* View Toggle */}
      <section className="bg-gray-900 border-b-2 border-brit-gold/30 py-4">
        <div className="container-custom">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedDate(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-brit-gold text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <List size={20} />
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-brit-gold text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Grid size={20} />
              Calendar View
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      {viewMode === 'list' && (
        <section className="bg-gray-900 border-b-2 border-brit-gold/30 py-6">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input pl-10 w-full bg-gray-800 border-gray-700 text-gray-200"
              >
                <option value="all">All Events ({events.length})</option>
                <option value="upcoming">Upcoming ({upcomingCount})</option>
                <option value="past">Past Events ({pastCount})</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full bg-gray-800 border-gray-700 text-gray-200"
            >
              <option value="date">Sort by Date (Earliest)</option>
              <option value="date-desc">Sort by Date (Latest)</option>
              <option value="venue">Sort by Venue</option>
            </select>
          </div>
        </div>
      </section>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <section className="bg-gray-900 py-6">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => changeMonth(-1)}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <h2 className="text-3xl font-black text-brit-gold uppercase">
                  {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => changeMonth(1)}
                  className="btn btn-outline flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-gray-800 rounded-2xl p-6 border-2 border-brit-gold/20">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-brit-gold py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                    const days = [];

                    // Empty cells for days before the first of the month
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      );
                    }

                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const hasEvents = hasEventsOnDate(date);
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());
                      const eventsCount = getEventsForDate(date).length;

                      days.push(
                        <button
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square rounded-lg p-2 text-center transition-all relative ${
                            isSelected
                              ? 'bg-brit-gold text-gray-900 font-bold scale-105 shadow-lg'
                              : hasEvents
                              ? 'bg-brit-blue/30 hover:bg-brit-blue/50 text-gray-200 font-semibold border-2 border-brit-gold/40'
                              : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400'
                          } ${isToday && !isSelected ? 'ring-2 ring-brit-red' : ''}`}
                        >
                          <div className="text-lg">{day}</div>
                          {hasEvents && (
                            <div className={`text-xs mt-1 ${isSelected ? 'text-gray-900' : 'text-brit-gold'}`}>
                              {eventsCount} event{eventsCount > 1 ? 's' : ''}
                            </div>
                          )}
                        </button>
                      );
                    }

                    return days;
                  })()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-brit-blue/30 border-2 border-brit-gold/40"></div>
                  <span className="text-gray-300">Has Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-brit-gold"></div>
                  <span className="text-gray-300">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-700/50 ring-2 ring-brit-red"></div>
                  <span className="text-gray-300">Today</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Grid/List */}
      <section className="section bg-gray-950">
        <div className="container-custom">
          {filteredEvents.length === 0 ? (
            <ScrollReveal animation="fade-up">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-heading mb-2 text-brit-gold">No Events Found</h3>
                <p className="text-gray-300 mb-6 text-lg">
                  {viewMode === 'calendar' && selectedDate
                    ? `No events scheduled for ${selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
                    : searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for upcoming events!'}
                </p>
                {viewMode === 'calendar' && selectedDate ? (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="btn btn-outline"
                  >
                    Clear Date Selection
                  </button>
                ) : (searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="btn btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </ScrollReveal>
          ) : (
            <>
              <div className="text-center mb-8">
                {viewMode === 'calendar' && selectedDate ? (
                  <>
                    <h3 className="text-2xl font-heading mb-2 text-brit-gold">
                      Events on {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-gray-300 text-lg mb-4">
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} scheduled
                    </p>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="btn btn-outline text-sm"
                    >
                      Clear Selection & View All Events
                    </button>
                  </>
                ) : (
                  <p className="text-gray-300 text-lg">
                    Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => {
                  const eventDate = new Date(event.event_date);
                  const isUpcoming = eventDate >= new Date();
                  const isSoon = isEventSoon(event.event_date);

                  return (
                    <ScrollReveal key={event.id} animation="fade-up" delay={index * 100}>
                      <div className="service-card h-full flex flex-col relative overflow-hidden">
                        {/* Event Image */}
                        {event.image_url ? (
                          <img
                            src={`${API_BASE_URL}${event.image_url}`}
                            alt={event.title}
                            className="w-full h-48 object-cover -mt-6 -mx-6 mb-4"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center -mt-6 -mx-6 mb-4" style={{
                            background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)'
                          }}>
                            <Calendar size={64} className="text-white opacity-50" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          {isSoon && isUpcoming && (
                            <span className="bg-brit-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              Coming Soon!
                            </span>
                          )}
                          {!isUpcoming && (
                            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm shadow-lg">
                              Past Event
                            </span>
                          )}
                        </div>

                        {/* Event Details */}
                        <h3 className="text-2xl font-black mb-3 text-center uppercase" style={{color: '#f0f0f0'}}>
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start" style={{color: '#f0f0f0'}}>
                            <Calendar size={18} className="mr-2 mt-0.5 flex-shrink-0 text-brit-gold" />
                            <div>
                              <div className="font-semibold">{formatDate(event.event_date)}</div>
                              <div className="text-sm text-gray-300">{formatTime(event.event_date)}</div>
                            </div>
                          </div>

                          {event.venue_name && (
                            <div className="flex items-start" style={{color: '#f0f0f0'}}>
                              <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0 text-brit-red" />
                              <div>
                                <div className="font-semibold">{event.venue_name}</div>
                                {event.venue_city && (
                                  <div className="text-sm text-gray-300">{event.venue_city}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-gray-300 text-base mb-4 line-clamp-3">
                            {event.description}
                          </p>
                        )}

                        {/* View Details Button */}
                        <div className="mt-auto pt-6">
                          {isUpcoming ? (
                            <Link
                              to="/contact"
                              className="btn btn-primary w-full text-center hover:scale-105 transform transition-transform"
                            >
                              Book This Event
                            </Link>
                          ) : (
                            <div className="text-center text-gray-400 text-sm py-3">
                              This event has ended
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">Want to Host an Event?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              We bring the fun to your venue! Contact us to discuss hosting a quiz night or special event.
            </p>
            <Link to="/contact" className="btn btn-secondary text-lg hover:scale-105 transform transition-transform">
              Get In Touch Today
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Events;
