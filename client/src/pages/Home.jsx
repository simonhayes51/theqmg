import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Beer, CalendarDays, MapPin, Search, Sparkles } from 'lucide-react';
import { eventsAPI, settingsAPI } from '../services/api';

const defaults = {
  landing_title: 'Find your next quiz night',
  landing_subtitle: 'QMG runs quiz nights, events and QMGHQ. Scan in, find the nearest quiz, or book one for your venue.',
  qmghq_subtitle: 'The home of quiz nights, drinks and good craic.',
};

function formatDate(value) {
  if (!value) return 'Date TBC';
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(value) {
  if (!value) return 'Time TBC';
  return value.slice(0, 5);
}

export default function Home() {
  const [settings, setSettings] = useState(defaults);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    try {
      const [settingsResponse, eventsResponse] = await Promise.all([
        settingsAPI.getAll(),
        eventsAPI.getAll({ upcoming: true, limit: 3 }),
      ]);
      setSettings({ ...defaults, ...(settingsResponse.data || {}) });
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
    } catch (error) {
      console.error('Error loading homepage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="home-product-hero">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-brit-gold/60 bg-brit-gold/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-brit-gold">
                QMG / QMGHQ
              </p>
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-none md:text-7xl">
                {settings.landing_title || defaults.landing_title}
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-gray-200 md:text-2xl">
                {settings.landing_subtitle || defaults.landing_subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/quiz" className="btn btn-primary inline-flex items-center justify-center gap-2 py-4 text-base">
                  <Search size={20} />
                  Find a Quiz
                </Link>
                <Link to="/hq" className="btn btn-outline inline-flex items-center justify-center gap-2 py-4 text-base">
                  <Beer size={20} />
                  QMGHQ
                </Link>
              </div>
            </div>

            <div className="home-scan-card">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-brit-gold p-3 text-gray-950">
                  <Sparkles size={28} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-brit-gold">Beer mat QR</p>
                  <h2 className="text-3xl font-black uppercase">Where's nearest quiz?</h2>
                </div>
              </div>
              <p className="text-lg text-gray-200">
                This is the useful bit: a fast mobile page for venues, punters and QR scans.
              </p>
              <Link to="/quiz" className="mt-6 flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4 font-black uppercase text-white transition hover:border-brit-gold hover:bg-brit-gold hover:text-gray-950">
                Open quiz finder
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-950">
        <div className="container-custom">
          <div className="grid gap-5 md:grid-cols-2">
            <Link to="/quiz" className="home-choice-card home-choice-card-qmg">
              <p className="text-sm font-black uppercase tracking-wide text-brit-gold">QMG</p>
              <h2 className="mt-2 text-4xl font-black uppercase">Quiz nights and events</h2>
              <p className="mt-4 text-lg text-gray-200">Find upcoming quiz nights, partner venues and booking details.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-black uppercase text-brit-gold">Find a quiz <ArrowRight size={18} /></span>
            </Link>

            <Link to="/hq" className="home-choice-card home-choice-card-hq">
              <p className="text-sm font-black uppercase tracking-wide text-brit-gold">QMGHQ</p>
              <h2 className="mt-2 text-4xl font-black uppercase">Pub / bar side</h2>
              <p className="mt-4 text-lg text-gray-200">{settings.qmghq_subtitle || defaults.qmghq_subtitle}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-black uppercase text-brit-gold">Visit HQ <ArrowRight size={18} /></span>
            </Link>
          </div>

          <div className="mt-12">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-brit-gold">Next up</p>
                <h2 className="text-4xl font-black uppercase">Upcoming quiz nights</h2>
              </div>
              <Link to="/quiz" className="text-brit-gold hover:text-white">See all</Link>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-lg bg-gray-800" />)}
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {events.map((event) => (
                  <article key={event.id} className="home-event-card">
                    <p className="flex items-center gap-2 text-brit-gold"><CalendarDays size={18} />{formatDate(event.event_date)}</p>
                    <h3 className="mt-3 text-2xl font-black uppercase">{event.title}</h3>
                    <p className="mt-2 flex items-start gap-2 text-gray-300"><MapPin className="mt-1 shrink-0 text-brit-red" size={18} />{event.venue_name || 'Venue TBC'}{event.venue_city ? `, ${event.venue_city}` : ''}</p>
                    <p className="mt-3 text-sm font-bold uppercase tracking-wide text-gray-400">{formatTime(event.event_time)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-gray-900 p-8 text-center">
                <h3 className="text-2xl font-black uppercase text-brit-gold">No events listed yet</h3>
                <p className="mt-2 text-gray-300">Add venues and events in admin, then the homepage and QR page fill themselves.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
