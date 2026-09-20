import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Beer, CalendarDays, Clock, MapPin, Music, Utensils } from 'lucide-react';
import { eventsAPI, settingsAPI, venuesAPI } from '../services/api';

const fallbackSettings = {
  qmghq_title: 'QMGHQ',
  qmghq_subtitle: 'The home of quiz nights, drinks and good craic.',
  qmghq_intro: 'A proper local base for QMG: quizzes, bar nights, events and private bookings.',
  qmghq_address: '',
  qmghq_hours: '',
};

function formatDate(value) {
  if (!value) return 'Date TBC';
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export default function QMGHQ() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, eventsResponse, venuesResponse] = await Promise.all([
        settingsAPI.getAll(),
        eventsAPI.getAll({ upcoming: true }),
        venuesAPI.getAll({ active: true }),
      ]);
      setSettings({ ...fallbackSettings, ...(settingsResponse.data || {}) });
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
      setVenues(Array.isArray(venuesResponse.data) ? venuesResponse.data : []);
    } catch (error) {
      console.error('Error loading QMGHQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const hqVenue = useMemo(() => {
    return venues.find((venue) => /qmghq|qmg hq|quiz master general hq/i.test(`${venue.name} ${venue.description}`));
  }, [venues]);

  const hqEvents = useMemo(() => {
    return events
      .filter((event) => /qmghq|qmg hq|hq|bar|pub/i.test(`${event.title} ${event.description} ${event.venue_name}`))
      .slice(0, 4);
  }, [events]);

  const address = settings.qmghq_address || [hqVenue?.address, hqVenue?.city, hqVenue?.postcode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="qr-app-topbar">
        <Link to="/" className="font-black uppercase tracking-tight">
          <span className="text-white">QMG</span><span className="text-brit-red">.</span>
        </Link>
        <div className="flex items-center gap-3 text-sm font-black uppercase">
          <Link to="/quiz" className="text-brit-gold">Find a quiz</Link>
          <Link to="/contact" className="text-gray-200">Book</Link>
        </div>
      </div>
      <section className="hq-hero">
        <div className="container-custom">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-brit-gold/60 bg-brit-gold/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-brit-gold">
              Pub / Bar
            </p>
            <h1 className="text-6xl font-black uppercase leading-none md:text-8xl">{settings.qmghq_title}</h1>
            <p className="mt-5 text-2xl text-gray-100">{settings.qmghq_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/quiz" className="btn btn-primary">Find a quiz</Link>
              <Link to="/contact" className="btn btn-outline">Enquire / book</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-950">
        <div className="container-custom">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-white/10 bg-gray-900 p-6 md:p-8">
              <h2 className="text-4xl font-black uppercase text-brit-gold">What is QMGHQ?</h2>
              <p className="mt-4 text-xl leading-relaxed text-gray-200">{settings.qmghq_intro}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="hq-feature"><Beer className="text-brit-gold" /><span>Bar nights</span></div>
                <div className="hq-feature"><Music className="text-brit-gold" /><span>Events</span></div>
                <div className="hq-feature"><Utensils className="text-brit-gold" /><span>Private hire</span></div>
              </div>
            </div>

            <aside className="rounded-lg border border-brit-gold/40 bg-brit-gold/10 p-6 md:p-8">
              <h2 className="text-3xl font-black uppercase text-brit-gold">Visit HQ</h2>
              <div className="mt-5 space-y-4 text-lg text-gray-100">
                {address && <p className="flex items-start gap-3"><MapPin className="mt-1 text-brit-gold" />{address}</p>}
                {settings.qmghq_hours && <p className="flex items-start gap-3"><Clock className="mt-1 text-brit-gold" />{settings.qmghq_hours}</p>}
                {!address && !settings.qmghq_hours && <p className="text-gray-300">Add QMGHQ address and hours in Site Editor.</p>}
              </div>
              {address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="btn btn-primary mt-6 inline-flex">
                  Open map
                </a>
              )}
            </aside>
          </div>

          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-brit-gold">Coming up</p>
                <h2 className="text-4xl font-black uppercase">HQ Events</h2>
              </div>
              <Link to="/events" className="hidden text-brit-gold hover:text-white sm:block">All events</Link>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-lg bg-gray-800" />)}</div>
            ) : hqEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {hqEvents.map((event) => (
                  <article key={event.id} className="quiz-listing-card">
                    <div>
                      <p className="flex items-center gap-2 text-brit-gold"><CalendarDays size={18} />{formatDate(event.event_date)}</p>
                      <h3 className="mt-2 text-2xl font-black uppercase">{event.title}</h3>
                      <p className="mt-1 text-gray-300">{event.venue_name || 'QMGHQ'}</p>
                    </div>
                    <Link to="/contact" className="btn btn-outline shrink-0">Ask</Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-gray-900 p-8 text-center">
                <h3 className="text-2xl font-black uppercase text-brit-gold">Events coming soon</h3>
                <p className="mt-2 text-gray-300">Add HQ events in the admin panel and they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
