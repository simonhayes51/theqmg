import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Compass, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { eventsAPI, settingsAPI } from '../services/api';

const fallbackSettings = {
  quiz_finder_title: 'Where is the nearest quiz?',
  quiz_finder_subtitle: 'Scan, search and find your next QMG quiz night.',
  quiz_finder_intro: 'Search by venue, town or postcode. Tap directions when you find the one.',
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDistanceMiles(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lng);
  if ([lat1, lon1, lat2, lon2].some(Number.isNaN)) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDate(value) {
  if (!value) return 'Date TBC';
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(value) {
  if (!value) return 'Time TBC';
  return value.slice(0, 5);
}

function mapsLink(event) {
  const query = [
    event.venue_name,
    event.venue_address,
    event.venue_city,
    event.venue_postcode,
  ].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || event.title)}`;
}

export default function QuizFinder() {
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(fallbackSettings);
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, settingsResponse] = await Promise.all([
        eventsAPI.getAll({ upcoming: true }),
        settingsAPI.getAll(),
      ]);
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
      setSettings({ ...fallbackSettings, ...(settingsResponse.data || {}) });
    } catch (error) {
      console.error('Error loading quiz finder:', error);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not available on this device.');
      return;
    }

    setLocating(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
        setLocationMessage('Sorted by distance from you.');
      },
      () => {
        setLocating(false);
        setLocationMessage('Could not use your location. Search by town or postcode instead.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const quizEvents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return events
      .map((event) => {
        const distance = getDistanceMiles(userLocation, {
          lat: event.venue_latitude,
          lng: event.venue_longitude,
        });
        return { ...event, distance };
      })
      .filter((event) => {
        if (!search) return true;
        return [
          event.title,
          event.description,
          event.venue_name,
          event.venue_address,
          event.venue_city,
          event.venue_postcode,
        ].filter(Boolean).some((value) => value.toLowerCase().includes(search));
      })
      .sort((a, b) => {
        if (userLocation && a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (userLocation && a.distance !== null) return -1;
        if (userLocation && b.distance !== null) return 1;
        return new Date(a.event_date) - new Date(b.event_date);
      });
  }, [events, query, userLocation]);

  const featured = quizEvents[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="qr-hero">
        <div className="container-custom">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-brit-gold/60 bg-brit-gold/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-brit-gold">
              QMG quiz finder
            </p>
            <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">{settings.quiz_finder_title}</h1>
            <p className="mt-5 max-w-2xl text-xl text-gray-200 md:text-2xl">{settings.quiz_finder_subtitle}</p>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-30 border-y border-white/10 bg-gray-950/95 py-4 backdrop-blur">
        <div className="container-custom">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search town, venue or postcode"
                className="input w-full py-4 pl-12 pr-12 text-lg"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <X size={22} />
                </button>
              )}
            </label>
            <button type="button" onClick={useMyLocation} disabled={locating} className="btn btn-primary inline-flex items-center justify-center gap-2 py-4">
              <LocateFixed size={20} />
              {locating ? 'Finding you...' : 'Use my location'}
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-300">{locationMessage || settings.quiz_finder_intro}</p>
        </div>
      </section>

      <section className="section bg-gray-950">
        <div className="container-custom">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg bg-gray-800" />)}
            </div>
          ) : quizEvents.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-lg border border-white/10 bg-gray-900 p-8 text-center">
              <Compass className="mx-auto mb-4 text-brit-gold" size={44} />
              <h2 className="text-3xl font-black uppercase text-brit-gold">No quizzes found</h2>
              <p className="mt-3 text-gray-300">Try a different town or check back when the next events are added.</p>
              <Link to="/contact" className="btn btn-primary mt-6 inline-flex">Ask about a quiz night</Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              {featured && (
                <article className="rounded-lg border border-brit-gold/50 bg-gradient-to-br from-brit-blue/40 to-brit-red/30 p-6 shadow-2xl">
                  <p className="text-sm font-black uppercase tracking-wide text-brit-gold">Best match</p>
                  <h2 className="mt-3 text-4xl font-black uppercase">{featured.title}</h2>
                  <p className="mt-3 text-xl text-gray-100">{featured.venue_name || 'Venue TBC'}</p>
                  <div className="mt-5 space-y-3 text-gray-100">
                    <p className="flex items-center gap-3"><CalendarDays className="text-brit-gold" />{formatDate(featured.event_date)}</p>
                    <p className="flex items-center gap-3"><Clock className="text-brit-gold" />{formatTime(featured.event_time)}</p>
                    <p className="flex items-start gap-3"><MapPin className="mt-1 text-brit-gold" />{[featured.venue_address, featured.venue_city, featured.venue_postcode].filter(Boolean).join(', ') || 'Location TBC'}</p>
                    {featured.distance !== null && <p className="font-black text-brit-gold">{featured.distance.toFixed(1)} miles away</p>}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <a href={mapsLink(featured)} target="_blank" rel="noreferrer" className="btn btn-primary text-center">Directions</a>
                    <Link to="/contact" className="btn btn-outline text-center">Book a quiz</Link>
                  </div>
                </article>
              )}

              <div className="space-y-4">
                {quizEvents.map((event) => (
                  <article key={event.id} className="quiz-listing-card">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-black uppercase tracking-wide text-brit-gold">
                        <span>{formatDate(event.event_date)}</span>
                        <span>{dayNames[new Date(event.event_date).getDay()]}</span>
                        {event.distance !== null && <span>{event.distance.toFixed(1)} miles</span>}
                      </div>
                      <h3 className="mt-2 text-2xl font-black uppercase text-white">{event.title}</h3>
                      <p className="mt-1 text-gray-300">{event.venue_name || 'Venue TBC'}{event.venue_city ? `, ${event.venue_city}` : ''}</p>
                      <p className="mt-2 text-sm text-gray-400">{formatTime(event.event_time)}</p>
                    </div>
                    <a href={mapsLink(event)} target="_blank" rel="noreferrer" className="btn btn-outline shrink-0 text-center">Map</a>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
