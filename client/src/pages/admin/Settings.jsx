import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  Contact,
  Eye,
  Globe,
  LayoutTemplate,
  Paintbrush,
  Save,
  Share2,
  Upload,
} from 'lucide-react';
import { galleryAPI, settingsAPI } from '../../services/api';
import { API_BASE_URL } from '../../utils/apiBase';

const defaultSettings = {
  business_name: 'The Quiz Master General',
  tagline: "North East England's premier quiz and entertainment provider",
  business_email: 'info@thequizmastergeneral.com',
  business_phone: '',
  business_address: '',
  business_city: 'Newcastle, Durham, Sunderland & surrounding areas',
  business_postcode: '',
  business_hours: '',
  hero_title: 'THE QUIZ MASTER GENERAL',
  hero_subtitle: "North East England's Premier Quiz & Entertainment",
  hero_button_1_text: 'Our Services',
  hero_button_2_text: 'Book Now',
  about_text: '',
  home_services_title: 'What We Offer',
  home_services_subtitle: 'Professional entertainment services that bring energy and excitement to your venue.',
  home_events_title: 'Upcoming Events',
  home_reviews_title: 'What Venues Say',
  home_gallery_title: 'See Us in Action',
  home_team_title: 'Meet the Team',
  services_page_title: 'Our Services',
  services_page_subtitle: 'Professional entertainment for your venue',
  contact_page_title: 'Get In Touch',
  contact_page_subtitle: "Let's discuss how we can bring entertainment to your venue.",
  events_page_title: 'Our Events',
  events_page_subtitle: 'Quiz nights, race nights, and special events across the North East',
  quiz_finder_title: 'Where is the nearest quiz?',
  quiz_finder_subtitle: 'Scan, search and find your next QMG quiz night.',
  quiz_finder_intro: 'Search by venue, town or postcode. Tap directions when you find the one.',
  venues_page_title: 'Our Partner Venues',
  venues_page_subtitle: 'Bringing entertainment to venues across the North East',
  qmghq_title: 'QMGHQ',
  qmghq_subtitle: 'The home of quiz nights, drinks and good craic.',
  qmghq_intro: 'A proper local base for QMG: quizzes, bar nights, events and private bookings.',
  qmghq_address: '',
  qmghq_hours: '',
  gallery_page_title: 'Gallery',
  gallery_page_subtitle: 'Memories from our amazing events',
  team_page_title: 'Meet The Team',
  team_page_subtitle: 'The professionals who bring the fun to your venue',
  logo_url: '',
  hero_image_url: '',
  about_image: '',
  social_proof_bg_color: '#003DA5',
  services_bg_color: '#DC143C',
  events_bg_color: '#003DA5',
  reviews_bg_color: '#DC143C',
  gallery_bg_color: '#003DA5',
  team_bg_color: '#DC143C',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
  instagram_enabled: 'false',
  instagram_access_token: '',
  instagram_user_id: '',
  facebook_enabled: 'false',
  facebook_access_token: '',
  facebook_page_id: '',
  whatsapp_enabled: 'false',
  whatsapp_number: '',
  whatsapp_default_message: "Hi, I'd like to know more about your quiz nights.",
};

const defaultSectionOrder = ['social_proof', 'about', 'services', 'events', 'reviews', 'gallery', 'team', 'social_media', 'question_of_day'];

const tabs = [
  { id: 'basics', label: 'Basics', icon: Building2 },
  { id: 'homepage', label: 'Homepage', icon: LayoutTemplate },
  { id: 'pages', label: 'Pages', icon: Globe },
  { id: 'look', label: 'Look', icon: Paintbrush },
  { id: 'contact', label: 'Contact', icon: Contact },
  { id: 'social', label: 'Social', icon: Share2 },
];

const sectionLabels = {
  social_proof: 'Stats strip',
  about: 'About section',
  services: 'Services',
  events: 'Upcoming events',
  reviews: 'Reviews',
  gallery: 'Gallery',
  team: 'Team',
  social_media: 'Social feed',
  question_of_day: 'Question of the day',
};

const backgroundSections = [
  { key: 'social_proof', label: 'Stats strip' },
  { key: 'about', label: 'About section' },
  { key: 'services', label: 'Services section' },
  { key: 'events', label: 'Events section' },
  { key: 'reviews', label: 'Reviews section' },
  { key: 'gallery', label: 'Gallery section' },
  { key: 'team', label: 'Team section' },
  { key: 'question_of_day', label: 'Question of the day' },
  { key: 'social_media', label: 'Social feed' },
  { key: 'footer', label: 'Footer' },
];

const colorFields = [
  { key: 'social_proof_bg_color', label: 'Stats strip' },
  { key: 'services_bg_color', label: 'Services' },
  { key: 'events_bg_color', label: 'Events' },
  { key: 'reviews_bg_color', label: 'Reviews' },
  { key: 'gallery_bg_color', label: 'Gallery' },
  { key: 'team_bg_color', label: 'Team' },
];

const pageFields = [
  ['services_page_title', 'services_page_subtitle', 'Services page'],
  ['quiz_finder_title', 'quiz_finder_subtitle', 'Find a quiz QR page'],
  ['events_page_title', 'events_page_subtitle', 'Events page'],
  ['qmghq_title', 'qmghq_subtitle', 'QMGHQ page'],
  ['venues_page_title', 'venues_page_subtitle', 'Venues page'],
  ['gallery_page_title', 'gallery_page_subtitle', 'Gallery page'],
  ['team_page_title', 'team_page_subtitle', 'Team page'],
  ['contact_page_title', 'contact_page_subtitle', 'Contact page'],
];

const textInputClass = 'input w-full';

function Field({ label, help, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {help && <span className="block mt-1 text-sm text-gray-300">{help}</span>}
    </label>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="admin-editor-card">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-brit-gold uppercase">{title}</h2>
        {description && <p className="text-gray-300 mt-2">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ImagePicker({ label, value, preview, onFile, onRemove, help }) {
  const src = preview || (value ? `${API_BASE_URL}${value}` : '');

  return (
    <div>
      <div className="label">{label}</div>
      {src && (
        <div className="relative mb-3 overflow-hidden rounded-lg border border-white/15 bg-gray-950">
          <img src={src} alt={`${label} preview`} className="h-52 w-full object-cover" />
          <button type="button" onClick={onRemove} className="absolute right-3 top-3 rounded bg-red-600 px-3 py-2 text-sm font-bold text-white">
            Remove
          </button>
        </div>
      )}
      <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/20 p-5 text-center transition hover:border-brit-gold hover:bg-white/5">
        <div>
          <Upload className="mx-auto mb-2 text-brit-gold" size={28} />
          <p className="font-bold text-white">Upload image</p>
          {help && <p className="mt-1 text-sm text-gray-300">{help}</p>}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" />
      </label>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('basics');
  const [settings, setSettings] = useState(defaultSettings);
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [uploads, setUploads] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const activeTabLabel = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label || 'Settings', [activeTab]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAllAdmin();
      const values = { ...defaultSettings };

      if (Array.isArray(response.data)) {
        response.data.forEach((setting) => {
          values[setting.setting_key] = setting.setting_value || '';
        });
      }

      setSettings(values);

      try {
        const parsedOrder = JSON.parse(values.section_order || '[]');
        setSectionOrder(Array.isArray(parsedOrder) && parsedOrder.length ? parsedOrder : defaultSectionOrder);
      } catch {
        setSectionOrder(defaultSectionOrder);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('Could not load settings. Refresh and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const setField = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleInput = (event) => {
    setField(event.target.name, event.target.value);
  };

  const setFile = (key) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploads((current) => ({ ...current, [key]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews((current) => ({ ...current, [key]: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeImage = (key) => {
    setUploads((current) => ({ ...current, [key]: null }));
    setPreviews((current) => ({ ...current, [key]: null }));
    setField(key, '');
  };

  const moveSection = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    const nextOrder = [...sectionOrder];
    [nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]];
    setSectionOrder(nextOrder);
  };

  const uploadImage = async (key, title, category = 'settings') => {
    const file = uploads[key];
    if (!file) return settings[key] || '';

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);

    const response = await galleryAPI.upload(formData);
    if (!response.data?.image_url) {
      throw new Error(`${title} upload failed`);
    }
    return response.data.image_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextSettings = { ...settings };
      nextSettings.logo_url = await uploadImage('logo_url', 'Site logo', 'logo');
      nextSettings.hero_image_url = await uploadImage('hero_image_url', 'Homepage hero image', 'hero');
      nextSettings.about_image = await uploadImage('about_image', 'About image', 'about');

      for (const section of backgroundSections) {
        const key = `${section.key}_bg_image`;
        nextSettings[key] = await uploadImage(key, `${section.label} background`, 'background');
      }

      nextSettings.section_order = JSON.stringify(sectionOrder);
      await settingsAPI.bulkUpdate(nextSettings);

      setSettings(nextSettings);
      setUploads({});
      setPreviews({});
      showMessage('Site editor saved.', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage(error.response?.data?.message || error.message || 'Could not save settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="admin-editor-card text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brit-gold border-t-transparent" />
          <p className="text-gray-200">Loading site editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brit-gold">Owner CMS</p>
          <h1 className="text-4xl font-black text-white">Site Editor</h1>
          <p className="mt-2 max-w-2xl text-gray-300">Edit the website in plain sections. Save once when you are done.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline inline-flex items-center gap-2">
          <Eye size={18} />
          Preview Site
        </a>
      </div>

      {message && (
        <div className={`mb-5 rounded-lg border p-4 font-bold ${message.type === 'success' ? 'border-green-500 bg-green-950/60 text-green-100' : 'border-red-500 bg-red-950/60 text-red-100'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-gray-900/70 p-2 md:grid-cols-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-black uppercase transition ${
                  activeTab === tab.id ? 'bg-brit-gold text-gray-950' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Editing: {activeTabLabel}</div>

        {activeTab === 'basics' && (
          <Panel title="Business Basics" description="The main business details used across the site.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Business name"><input name="business_name" value={settings.business_name} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Short tagline"><input name="tagline" value={settings.tagline} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Email"><input name="business_email" value={settings.business_email} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Phone"><input name="business_phone" value={settings.business_phone} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Address"><input name="business_address" value={settings.business_address} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Area covered"><input name="business_city" value={settings.business_city} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Postcode"><input name="business_postcode" value={settings.business_postcode} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Opening or contact hours"><textarea name="business_hours" value={settings.business_hours} onChange={handleInput} rows="4" className="textarea w-full" /></Field>
            </div>
          </Panel>
        )}

        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <Panel title="Homepage Hero" description="The first thing visitors see. Keep it short and punchy.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Main headline"><input name="hero_title" value={settings.hero_title} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Subtitle"><input name="hero_subtitle" value={settings.hero_subtitle} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Primary button"><input name="hero_button_1_text" value={settings.hero_button_1_text} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Secondary button"><input name="hero_button_2_text" value={settings.hero_button_2_text} onChange={handleInput} className={textInputClass} /></Field>
              </div>
            </Panel>

            <Panel title="Homepage Sections" description="Rename homepage blocks and choose their order.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Services title"><input name="home_services_title" value={settings.home_services_title} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Services subtitle"><input name="home_services_subtitle" value={settings.home_services_subtitle} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Events title"><input name="home_events_title" value={settings.home_events_title} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Reviews title"><input name="home_reviews_title" value={settings.home_reviews_title} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Gallery title"><input name="home_gallery_title" value={settings.home_gallery_title} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Team title"><input name="home_team_title" value={settings.home_team_title} onChange={handleInput} className={textInputClass} /></Field>
              </div>

              <div className="mt-8 space-y-3">
                {sectionOrder.map((section, index) => (
                  <div key={section} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brit-blue font-black text-white">{index + 1}</span>
                    <span className="flex-1 font-bold text-white">{sectionLabels[section] || section}</span>
                    <button type="button" onClick={() => moveSection(index, -1)} className="rounded bg-white/10 p-2 text-white disabled:opacity-30" disabled={index === 0}><ArrowUp size={18} /></button>
                    <button type="button" onClick={() => moveSection(index, 1)} className="rounded bg-white/10 p-2 text-white disabled:opacity-30" disabled={index === sectionOrder.length - 1}><ArrowDown size={18} /></button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'pages' && (
          <Panel title="Page Headers" description="Change the title and intro text at the top of each public page.">
            <div className="space-y-6">
              {pageFields.map(([titleKey, subtitleKey, label]) => (
                <div key={titleKey} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 text-xl font-black text-brit-gold">{label}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title"><input name={titleKey} value={settings[titleKey]} onChange={handleInput} className={textInputClass} /></Field>
                    <Field label="Subtitle"><input name={subtitleKey} value={settings[subtitleKey]} onChange={handleInput} className={textInputClass} /></Field>
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-brit-gold/30 bg-brit-gold/10 p-4">
                <h3 className="mb-4 text-xl font-black text-brit-gold">Beer mat QR page</h3>
                <Field label="Helper text under search"><textarea name="quiz_finder_intro" value={settings.quiz_finder_intro} onChange={handleInput} rows="3" className="textarea w-full" /></Field>
              </div>
              <div className="rounded-lg border border-brit-gold/30 bg-brit-gold/10 p-4">
                <h3 className="mb-4 text-xl font-black text-brit-gold">QMGHQ pub/bar page</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Address"><input name="qmghq_address" value={settings.qmghq_address} onChange={handleInput} className={textInputClass} /></Field>
                  <Field label="Opening hours"><input name="qmghq_hours" value={settings.qmghq_hours} onChange={handleInput} className={textInputClass} /></Field>
                  <div className="md:col-span-2">
                    <Field label="About QMGHQ"><textarea name="qmghq_intro" value={settings.qmghq_intro} onChange={handleInput} rows="4" className="textarea w-full" /></Field>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {activeTab === 'look' && (
          <div className="space-y-6">
            <Panel title="Images" description="Upload the main brand images.">
              <div className="grid gap-6 lg:grid-cols-3">
                <ImagePicker label="Logo" value={settings.logo_url} preview={previews.logo_url} onFile={setFile('logo_url')} onRemove={() => removeImage('logo_url')} help="Transparent PNG works best." />
                <ImagePicker label="Homepage hero image" value={settings.hero_image_url} preview={previews.hero_image_url} onFile={setFile('hero_image_url')} onRemove={() => removeImage('hero_image_url')} help="Wide venue/event photo works best." />
                <ImagePicker label="About image" value={settings.about_image} preview={previews.about_image} onFile={setFile('about_image')} onRemove={() => removeImage('about_image')} help="Photo of the host/team." />
              </div>
              <div className="mt-6">
                <Field label="About text"><textarea name="about_text" value={settings.about_text} onChange={handleInput} rows="6" className="textarea w-full" /></Field>
              </div>
            </Panel>

            <Panel title="Colours" description="Choose section colour accents.">
              <div className="grid gap-4 md:grid-cols-3">
                {colorFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    <input type="color" name={field.key} value={settings[field.key] || '#003DA5'} onChange={handleInput} className="h-12 w-full cursor-pointer rounded border border-white/20 bg-transparent" />
                  </Field>
                ))}
              </div>
            </Panel>

            <Panel title="Optional Section Backgrounds" description="Use sparingly. Strong photos can lift the page; weak photos can make it look busy.">
              <div className="grid gap-5 md:grid-cols-2">
                {backgroundSections.map((section) => {
                  const key = `${section.key}_bg_image`;
                  return <ImagePicker key={key} label={section.label} value={settings[key]} preview={previews[key]} onFile={setFile(key)} onRemove={() => removeImage(key)} />;
                })}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'contact' && (
          <Panel title="Contact And WhatsApp" description="Make it easy for venues to get in touch.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="WhatsApp number" help="Use UK format like 447700900000, no spaces."><input name="whatsapp_number" value={settings.whatsapp_number} onChange={handleInput} className={textInputClass} /></Field>
              <Field label="Show WhatsApp button">
                <select name="whatsapp_enabled" value={settings.whatsapp_enabled} onChange={handleInput} className={textInputClass}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Default WhatsApp message"><textarea name="whatsapp_default_message" value={settings.whatsapp_default_message} onChange={handleInput} rows="3" className="textarea w-full" /></Field>
              </div>
            </div>
          </Panel>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <Panel title="Social Links" description="Footer links. Leave blank to hide an icon.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Facebook URL"><input name="facebook_url" value={settings.facebook_url} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Instagram URL"><input name="instagram_url" value={settings.instagram_url} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="X/Twitter URL"><input name="twitter_url" value={settings.twitter_url} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="LinkedIn URL"><input name="linkedin_url" value={settings.linkedin_url} onChange={handleInput} className={textInputClass} /></Field>
              </div>
            </Panel>

            <Panel title="Live Social Feeds" description="Optional advanced setup. Most owners can ignore this.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Instagram feed"><select name="instagram_enabled" value={settings.instagram_enabled} onChange={handleInput} className={textInputClass}><option value="false">Off</option><option value="true">On</option></select></Field>
                <Field label="Facebook feed"><select name="facebook_enabled" value={settings.facebook_enabled} onChange={handleInput} className={textInputClass}><option value="false">Off</option><option value="true">On</option></select></Field>
                <Field label="Instagram access token"><input name="instagram_access_token" value={settings.instagram_access_token} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Instagram user ID"><input name="instagram_user_id" value={settings.instagram_user_id} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Facebook page access token"><input name="facebook_access_token" value={settings.facebook_access_token} onChange={handleInput} className={textInputClass} /></Field>
                <Field label="Facebook page ID"><input name="facebook_page_id" value={settings.facebook_page_id} onChange={handleInput} className={textInputClass} /></Field>
              </div>
            </Panel>
          </div>
        )}

        <div className="sticky bottom-4 mt-8 flex justify-end">
          <button type="submit" disabled={submitting} className="btn btn-primary inline-flex items-center gap-2 px-8">
            {submitting ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving</> : <><Save size={20} />Save Site</>}
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-lg border border-green-500/30 bg-green-950/30 p-4 text-green-100">
        <div className="flex items-center gap-2 font-bold"><Check size={18} />Tip for the owner</div>
        <p className="mt-1 text-sm">Add venues, services, reviews and photos from their own dashboard pages. Use this Site Editor for wording, branding, contact details and layout.</p>
      </div>
    </div>
  );
}
