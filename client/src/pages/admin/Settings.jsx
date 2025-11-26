import { useEffect, useState } from 'react';
import { settingsAPI, galleryAPI } from '../../services/api';
import { Save, Building2, Phone, Mail, Clock, Globe, Facebook, Twitter, Instagram, Linkedin, Upload, Image as ImageIcon, Sparkles, MessageCircle, Key, Hash, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Business Info
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_city: '',
    business_postcode: '',

    // Social Media Links
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',

    // Social Media API Integration
    instagram_access_token: '',
    instagram_user_id: '',
    instagram_enabled: 'false',
    facebook_access_token: '',
    facebook_page_id: '',
    facebook_enabled: 'false',
    whatsapp_number: '',
    whatsapp_enabled: 'false',
    whatsapp_default_message: '',

    // Business Hours
    business_hours: '',

    // About
    about_text: '',
    tagline: '',

    // Hero Image
    hero_image_url: '',

    // Logo
    logo_url: '',

    // Hero Section Content
    hero_title: '',
    hero_subtitle: '',
    hero_button_1_text: '',
    hero_button_2_text: '',

    // Page Headers
    services_page_title: '',
    services_page_subtitle: '',
    contact_page_title: '',
    contact_page_subtitle: '',
    events_page_title: '',
    events_page_subtitle: '',
    venues_page_title: '',
    venues_page_subtitle: '',
    gallery_page_title: '',
    gallery_page_subtitle: '',
    team_page_title: '',
    team_page_subtitle: '',

    // Homepage Section Titles
    home_services_title: '',
    home_services_subtitle: '',
    home_events_title: '',
    home_gallery_title: '',
    home_team_title: '',
    home_reviews_title: '',

    // Section Background Images
    services_bg_image: '',
    events_bg_image: '',
    gallery_bg_image: '',
    team_bg_image: '',
    reviews_bg_image: '',
    footer_bg_image: '',

    // Section Background Colors
    social_proof_bg_color: '#003DA5',
    services_bg_color: '#DC143C',
    events_bg_color: '#003DA5',
    reviews_bg_color: '#DC143C',
    gallery_bg_color: '#003DA5',
    team_bg_color: '#DC143C'
  });

  const [heroImage, setHeroImage] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [sectionBgImages, setSectionBgImages] = useState({});
  const [sectionBgPreviews, setSectionBgPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Section ordering - default order
  const defaultSectionOrder = ['social_proof', 'about', 'services', 'events', 'reviews', 'gallery', 'team', 'social_media', 'question_of_day'];
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAllAdmin();

      // Convert array of settings to object
      const settingsObj = {};
      if (Array.isArray(response.data)) {
        response.data.forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value || '';
        });
      }

      // Merge with default values
      setSettings(prev => ({ ...prev, ...settingsObj }));

      // Load section order
      if (settingsObj.section_order) {
        try {
          const parsedOrder = JSON.parse(settingsObj.section_order);
          setSectionOrder(Array.isArray(parsedOrder) ? parsedOrder : defaultSectionOrder);
        } catch (e) {
          setSectionOrder(defaultSectionOrder);
        }
      }

      // Set hero image preview if it exists
      if (settingsObj.hero_image_url) {
        setHeroImagePreview(`${API_BASE_URL}${settingsObj.hero_image_url}`);
      }

      // Set logo preview if it exists
      if (settingsObj.logo_url) {
        setLogoPreview(`${API_BASE_URL}${settingsObj.logo_url}`);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('Failed to load settings. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionBgImageChange = (section) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setSectionBgImages(prev => ({ ...prev, [section]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setSectionBgPreviews(prev => ({ ...prev, [section]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Upload hero image first if one was selected
      if (heroImage) {
        console.log('Uploading hero image...');
        const formData = new FormData();
        formData.append('image', heroImage);
        formData.append('title', 'Hero Image');
        formData.append('category', 'hero');
        formData.append('description', 'Site hero/banner image');

        const uploadRes = await galleryAPI.upload(formData);
        console.log('Hero image upload response:', uploadRes.data);
        if (uploadRes.data && uploadRes.data.image_url) {
          settings.hero_image_url = uploadRes.data.image_url;
          console.log('Hero image URL set:', settings.hero_image_url);
        } else {
          console.error('Hero image upload succeeded but no image_url in response');
          throw new Error('Hero image upload failed - no image URL returned');
        }
      }

      // Upload logo if one was selected
      if (logo) {
        console.log('Uploading logo...');
        const formData = new FormData();
        formData.append('image', logo);
        formData.append('title', 'Site Logo');
        formData.append('category', 'logo');
        formData.append('description', 'Site header logo');

        const uploadRes = await galleryAPI.upload(formData);
        console.log('Logo upload response:', uploadRes.data);
        if (uploadRes.data && uploadRes.data.image_url) {
          settings.logo_url = uploadRes.data.image_url;
          console.log('Logo URL set:', settings.logo_url);
        } else {
          console.error('Logo upload succeeded but no image_url in response');
          throw new Error('Logo upload failed - no image URL returned');
        }
      }

      // Upload section background images
      const sectionKeys = ['social_proof', 'services', 'events', 'gallery', 'team', 'reviews', 'footer'];
      for (const section of sectionKeys) {
        if (sectionBgImages[section]) {
          const formData = new FormData();
          formData.append('image', sectionBgImages[section]);
          formData.append('title', `${section} Background`);
          formData.append('category', 'background');

          const uploadRes = await galleryAPI.upload(formData);
          if (uploadRes.data && uploadRes.data.image_url) {
            settings[`${section}_bg_image`] = uploadRes.data.image_url;
          }
        }
      }

      // Save section order
      settings.section_order = JSON.stringify(sectionOrder);

      console.log('Saving settings to backend:', Object.keys(settings).length, 'settings');
      const saveResponse = await settingsAPI.bulkUpdate(settings);
      console.log('Settings save response:', saveResponse.data);

      showMessage('✅ Settings saved successfully!', 'success');
      setHeroImage(null);
      setLogo(null);
      setSectionBgImages({});

      // Reload settings to get fresh data
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save settings';
      showMessage(`❌ ${errorMessage}. Please try again.`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Section ordering functions
  const moveSectionUp = (index) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSectionOrder(newOrder);
  };

  const moveSectionDown = (index) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const getSectionLabel = (key) => {
    const labels = {
      'social_proof': 'Stats/Social Proof Section',
      'about': 'About Me Section',
      'services': 'Services Section',
      'events': 'Upcoming Events Section',
      'reviews': 'Reviews Section',
      'gallery': 'Photo Gallery Section',
      'team': 'Meet the Team Section',
      'social_media': 'Social Media Feed',
      'question_of_day': 'Question of the Day'
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Site Settings</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 md:py-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-heading text-quiz-blue">Site Settings</h1>
        <p className="text-sm md:text-base text-gray-800 mt-2 font-medium">Manage your business information and social media links</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded border-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Business Information */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Building2 className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Business Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={settings.business_name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., The Quiz Master General"
              />
              <p className="text-xs text-gray-500 mt-1">Your business or company name</p>
            </div>

            <div className="md:col-span-2">
              <label className="label">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Newcastle's Premier Quiz Host"
              />
              <p className="text-xs text-gray-500 mt-1">A short tagline or slogan for your business</p>
            </div>

            <div>
              <label className="label">
                <Mail size={16} className="inline mr-1" />
                Business Email
              </label>
              <input
                type="email"
                name="business_email"
                value={settings.business_email}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., info@thequizmastergeneral.com"
              />
            </div>

            <div>
              <label className="label">
                <Phone size={16} className="inline mr-1" />
                Business Phone
              </label>
              <input
                type="tel"
                name="business_phone"
                value={settings.business_phone}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., 0191 123 4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Street Address</label>
              <input
                type="text"
                name="business_address"
                value={settings.business_address}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., 123 High Street"
              />
            </div>

            <div>
              <label className="label">City/Town</label>
              <input
                type="text"
                name="business_city"
                value={settings.business_city}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Newcastle"
              />
            </div>

            <div>
              <label className="label">Postcode</label>
              <input
                type="text"
                name="business_postcode"
                value={settings.business_postcode}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., NE1 1AA"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Content */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Sparkles className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Hero Section Content</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Hero Title</label>
              <input
                type="text"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., THE QUIZ MASTER GENERAL"
              />
              <p className="text-xs text-gray-500 mt-1">Large title displayed on homepage hero</p>
            </div>

            <div>
              <label className="label">Hero Subtitle</label>
              <input
                type="text"
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., North East England's Premier Quiz & Entertainment"
              />
              <p className="text-xs text-gray-500 mt-1">Subtitle text below the hero title</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Button Text</label>
                <input
                  type="text"
                  name="hero_button_1_text"
                  value={settings.hero_button_1_text}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Our Services"
                />
              </div>

              <div>
                <label className="label">Secondary Button Text</label>
                <input
                  type="text"
                  name="hero_button_2_text"
                  value={settings.hero_button_2_text}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Book Now"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homepage Section Titles */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Globe className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Homepage Section Titles</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="label">Services Section Title</label>
              <input
                type="text"
                name="home_services_title"
                value={settings.home_services_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., What We Offer"
              />
            </div>

            <div>
              <label className="label">Services Section Subtitle</label>
              <input
                type="text"
                name="home_services_subtitle"
                value={settings.home_services_subtitle}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Professional entertainment services..."
              />
            </div>

            <div>
              <label className="label">Events Section Title</label>
              <input
                type="text"
                name="home_events_title"
                value={settings.home_events_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Upcoming Events"
              />
            </div>

            <div>
              <label className="label">Gallery Section Title</label>
              <input
                type="text"
                name="home_gallery_title"
                value={settings.home_gallery_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Gallery Highlights"
              />
            </div>

            <div>
              <label className="label">Team Section Title</label>
              <input
                type="text"
                name="home_team_title"
                value={settings.home_team_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., Meet The Team"
              />
            </div>

            <div>
              <label className="label">Reviews Section Title</label>
              <input
                type="text"
                name="home_reviews_title"
                value={settings.home_reviews_title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="e.g., What Our Clients Say"
              />
            </div>
          </div>
        </div>

        {/* Page Headers */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Globe className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Page Headers</h2>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-bold mb-4">Services Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="services_page_title"
                    value={settings.services_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Our Services"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="services_page_subtitle"
                    value={settings.services_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Professional entertainment for your venue"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-bold mb-4">Contact Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="contact_page_title"
                    value={settings.contact_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Get In Touch"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="contact_page_subtitle"
                    value={settings.contact_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Let's discuss how we can bring entertainment to your venue"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-bold mb-4">Events Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="events_page_title"
                    value={settings.events_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Upcoming Events"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="events_page_subtitle"
                    value={settings.events_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Join us for exciting quiz nights and entertainment"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-bold mb-4">Venues Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="venues_page_title"
                    value={settings.venues_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Our Venues"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="venues_page_subtitle"
                    value={settings.venues_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Find your nearest quiz night location"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-bold mb-4">Gallery Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="gallery_page_title"
                    value={settings.gallery_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Photo Gallery"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="gallery_page_subtitle"
                    value={settings.gallery_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Moments from our events"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Team Page</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    type="text"
                    name="team_page_title"
                    value={settings.team_page_title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Meet The Team"
                  />
                </div>
                <div>
                  <label className="label">Page Subtitle</label>
                  <input
                    type="text"
                    name="team_page_subtitle"
                    value={settings.team_page_subtitle}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., The people who make it all happen"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <ImageIcon className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Site Logo</h2>
          </div>

          <div>
            <label className="label">Header Logo</label>
            <div className="space-y-3">
              {/* Logo Preview */}
              {logoPreview && (
                <div className="relative w-full max-w-md border-2 border-gray-200 rounded overflow-hidden bg-gray-900 p-4">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-auto object-contain max-h-32"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogo(null);
                      setSettings(prev => ({ ...prev, logo_url: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    Remove Logo
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-quiz-blue hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-900 font-medium">
                    <span className="text-quiz-blue font-semibold">Click to upload</span> site logo
                  </p>
                  <p className="text-xs text-gray-800 mt-1 font-medium">PNG or SVG recommended (transparent background)</p>
                </div>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
              <p className="text-sm text-gray-900 font-medium">
                <strong className="text-brit-blue">💡 Tip:</strong> Upload a logo with a transparent background (PNG or SVG). The logo will appear in the header and overlap slightly into the page content for a modern look. Recommended height: 80-120px.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <ImageIcon className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Hero Image</h2>
          </div>

          <div>
            <label className="label">Homepage Hero Background Image</label>
            <div className="space-y-3">
              {/* Image Preview */}
              {heroImagePreview && (
                <div className="relative w-full h-64 border-2 border-gray-200 rounded overflow-hidden">
                  <img
                    src={heroImagePreview}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHeroImagePreview(null);
                      setHeroImage(null);
                      setSettings(prev => ({ ...prev, hero_image_url: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-quiz-blue hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-900 font-medium">
                    <span className="text-quiz-blue font-semibold">Click to upload</span> hero image
                  </p>
                  <p className="text-xs text-gray-800 mt-1 font-medium">PNG, JPG, GIF or WebP (recommended: 1920x1080px)</p>
                </div>
                <input
                  type="file"
                  onChange={handleHeroImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
              <p className="text-sm text-gray-900 font-medium">
                <strong className="text-brit-blue">💡 Tip:</strong> Upload a vibrant, eye-catching image for your homepage hero section. For best results, use an image that's at least 1920px wide.
              </p>
            </div>
          </div>
        </div>

        {/* Section Background Colors */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Sparkles className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Section Background Colors</h2>
          </div>
          <p className="text-sm md:text-base text-gray-900 mb-6 font-medium">Customize the background colors for each homepage section</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-bold">Social Proof Section Color</label>
              <input
                type="color"
                name="social_proof_bg_color"
                value={settings.social_proof_bg_color || '#003DA5'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Stats section (500+ Events, etc.)</p>
            </div>

            <div>
              <label className="label font-bold">Services Section Color</label>
              <input
                type="color"
                name="services_bg_color"
                value={settings.services_bg_color || '#DC143C'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">"What We Offer" section</p>
            </div>

            <div>
              <label className="label font-bold">Events Section Color</label>
              <input
                type="color"
                name="events_bg_color"
                value={settings.events_bg_color || '#003DA5'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">"Upcoming Events" section</p>
            </div>

            <div>
              <label className="label font-bold">Reviews Section Color</label>
              <input
                type="color"
                name="reviews_bg_color"
                value={settings.reviews_bg_color || '#DC143C'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Testimonials section</p>
            </div>

            <div>
              <label className="label font-bold">Gallery Section Color</label>
              <input
                type="color"
                name="gallery_bg_color"
                value={settings.gallery_bg_color || '#003DA5'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">"See Us in Action" photo gallery</p>
            </div>

            <div>
              <label className="label font-bold">Team Section Color</label>
              <input
                type="color"
                name="team_bg_color"
                value={settings.team_bg_color || '#DC143C'}
                onChange={handleInputChange}
                className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">"Meet the Team" section</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
            <p className="text-sm text-gray-900 font-medium">
              <strong className="text-brit-blue">💡 Tip:</strong> If you upload a background image for a section, the color will be used as an overlay. Without an image, the solid color will be displayed.
            </p>
          </div>
        </div>

        {/* Section Ordering */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <GripVertical className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Homepage Section Order</h2>
          </div>
          <p className="text-sm md:text-base text-gray-900 mb-6 font-medium">Control the order in which sections appear on your homepage. Hero section is always first, and CTA is always last.</p>

          <div className="space-y-3">
            {sectionOrder.map((sectionKey, index) => (
              <div key={sectionKey} className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-brit-blue/50 transition-colors">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-brit-blue hover:bg-white'
                    }`}
                    title="Move up"
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSectionDown(index)}
                    disabled={index === sectionOrder.length - 1}
                    className={`p-1 rounded transition-colors ${
                      index === sectionOrder.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-brit-blue hover:bg-white'
                    }`}
                    title="Move down"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex items-center justify-center w-8 h-8 bg-brit-blue text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-gray-900">{getSectionLabel(sectionKey)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
            <p className="text-sm text-gray-900 font-medium">
              <strong className="text-brit-blue">💡 Tip:</strong> Click the arrow buttons to reorder sections. The order will be saved when you click "Save All Settings" at the bottom of the page.
            </p>
          </div>
        </div>

        {/* Section Background Images */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <ImageIcon className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Section Background Images (Optional)</h2>
          </div>
          <p className="text-sm md:text-base text-gray-900 mb-6 font-medium">Upload background images for each section on your homepage (colors will be used as overlay)</p>

          <div className="space-y-8">
            {[
              { key: 'social_proof', label: 'Stats/Social Proof Section' },
              { key: 'services', label: 'Services Section' },
              { key: 'events', label: 'Events Section' },
              { key: 'gallery', label: 'Gallery Section' },
              { key: 'team', label: 'Team Section' },
              { key: 'reviews', label: 'Reviews Section' },
              { key: 'footer', label: 'Footer Section' }
            ].map(({ key, label }) => (
              <div key={key} className="border-2 border-gray-200 rounded-lg p-4">
                <label className="label font-bold">{label}</label>

                {/* Image Preview */}
                {(sectionBgPreviews[key] || settings[`${key}_bg_image`]) && (
                  <div className="relative w-full h-48 border-2 border-gray-200 rounded overflow-hidden mb-3">
                    <img
                      src={sectionBgPreviews[key] || `${API_BASE_URL}${settings[`${key}_bg_image`]}`}
                      alt={`${label} Preview`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSectionBgPreviews(prev => ({ ...prev, [key]: null }));
                        setSectionBgImages(prev => ({ ...prev, [key]: null }));
                        setSettings(prev => ({ ...prev, [`${key}_bg_image`]: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-quiz-blue hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-sm text-gray-900 font-medium">
                      <span className="text-quiz-blue font-semibold">Upload</span> {label.toLowerCase()} background
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleSectionBgImageChange(key)}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
            <p className="text-sm text-gray-900 font-medium">
              <strong className="text-brit-blue">💡 Tip:</strong> Use high-quality images (1920px wide recommended) that complement your content. Images will be used as full-width section backgrounds.
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Clock className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Business Hours</h2>
          </div>

          <div>
            <label className="label">Operating Hours</label>
            <textarea
              name="business_hours"
              value={settings.business_hours}
              onChange={handleInputChange}
              rows="4"
              className="textarea w-full"
              placeholder="e.g.,
Monday - Friday: 9am - 5pm
Saturday: 10am - 4pm
Sunday: Closed"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Your availability or office hours (one per line)</p>
          </div>
        </div>

        {/* About Section */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Globe className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">About Your Business</h2>
          </div>

          <div>
            <label className="label">About Text</label>
            <textarea
              name="about_text"
              value={settings.about_text}
              onChange={handleInputChange}
              rows="6"
              className="textarea w-full"
              placeholder="Tell visitors about your business, your experience, what makes you unique..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">This text may appear on your homepage or about page</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Globe className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Social Media Links</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                <Facebook size={16} className="inline mr-1" />
                Facebook Page URL
              </label>
              <input
                type="url"
                name="facebook_url"
                value={settings.facebook_url}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="label">
                <Twitter size={16} className="inline mr-1" />
                Twitter/X Profile URL
              </label>
              <input
                type="url"
                name="twitter_url"
                value={settings.twitter_url}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="https://twitter.com/yourprofile"
              />
            </div>

            <div>
              <label className="label">
                <Instagram size={16} className="inline mr-1" />
                Instagram Profile URL
              </label>
              <input
                type="url"
                name="instagram_url"
                value={settings.instagram_url}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div>
              <label className="label">
                <Linkedin size={16} className="inline mr-1" />
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={settings.linkedin_url}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-brit-blue/10 border-2 border-brit-blue/30 rounded">
            <p className="text-sm text-gray-900 font-medium">
              <strong className="text-brit-blue">💡 Tip:</strong> Social media links will appear in your website footer and contact sections. Leave blank to hide any social media icons you don't use.
            </p>
          </div>
        </div>

        {/* Social Media API Integration */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-6">
            <Sparkles className="text-quiz-blue mr-2 md:mr-3 flex-shrink-0" size={24} />
            <h2 className="text-lg md:text-2xl font-heading text-quiz-blue">Social Media Integration</h2>
          </div>

          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2" style={{ color: '#000000' }}>📸 Display Live Posts & Enable WhatsApp Chat</h3>
            <p className="text-sm text-gray-900 mb-3 font-medium" style={{ color: '#000000' }}>
              Connect your Instagram and Facebook accounts to display real posts on your homepage. Enable WhatsApp for instant customer messaging.
            </p>
            <p className="text-xs text-gray-800 font-medium" style={{ color: '#000000' }}>
              📖 Need help? Check <code className="bg-white px-2 py-1 rounded text-gray-900" style={{ color: '#000000' }}>SOCIAL_MEDIA_SETUP.md</code> for step-by-step setup instructions.
            </p>
          </div>

          {/* Instagram Integration */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
            <div className="flex items-center mb-4">
              <Instagram className="text-purple-600 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900" style={{ color: '#000000' }}>Instagram Feed</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="instagram_enabled"
                    checked={settings.instagram_enabled === 'true'}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_enabled: e.target.checked ? 'true' : 'false' }))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="font-semibold text-gray-900" style={{ color: '#000000' }}>Enable Instagram Feed</span>
                </label>
                <p className="text-xs text-gray-800 ml-6 font-medium" style={{ color: '#000000' }}>Display your Instagram posts on the homepage</p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <Key size={16} className="text-purple-600" />
                  Instagram Access Token
                </label>
                <input
                  type="text"
                  name="instagram_access_token"
                  value={settings.instagram_access_token}
                  onChange={handleInputChange}
                  className="input w-full font-mono text-sm"
                  placeholder="IGQVJxxxxxxxxxxxxxxxxxxxxxxxxx..."
                  disabled={settings.instagram_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Get from Facebook Developer Console → Instagram Basic Display API
                </p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <Hash size={16} className="text-purple-600" />
                  Instagram User ID
                </label>
                <input
                  type="text"
                  name="instagram_user_id"
                  value={settings.instagram_user_id}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="17841400000000000"
                  disabled={settings.instagram_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Your numeric Instagram user ID
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded text-xs font-medium text-gray-900 border border-purple-300" style={{ color: '#000000' }}>
                <strong className="text-purple-700" style={{ color: '#6b21a8' }}>⏰ Note:</strong> Access tokens expire after 60 days. You'll need to refresh them periodically.
              </div>
            </div>
          </div>

          {/* Facebook Integration */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-center mb-4">
              <Facebook className="text-blue-600 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900" style={{ color: '#000000' }}>Facebook Feed</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="facebook_enabled"
                    checked={settings.facebook_enabled === 'true'}
                    onChange={(e) => setSettings(prev => ({ ...prev, facebook_enabled: e.target.checked ? 'true' : 'false' }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-semibold text-gray-900" style={{ color: '#000000' }}>Enable Facebook Feed</span>
                </label>
                <p className="text-xs text-gray-800 ml-6 font-medium" style={{ color: '#000000' }}>Display your Facebook page posts on the homepage</p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <Key size={16} className="text-blue-600" />
                  Facebook Page Access Token
                </label>
                <input
                  type="text"
                  name="facebook_access_token"
                  value={settings.facebook_access_token}
                  onChange={handleInputChange}
                  className="input w-full font-mono text-sm"
                  placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx..."
                  disabled={settings.facebook_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Get from Facebook Graph API Explorer → Your Page
                </p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <Hash size={16} className="text-blue-600" />
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  name="facebook_page_id"
                  value={settings.facebook_page_id}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="123456789012345"
                  disabled={settings.facebook_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Your Facebook Page ID (found in Page Settings)
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded text-xs font-medium text-gray-900 border border-blue-300" style={{ color: '#000000' }}>
                <strong className="text-brit-blue" style={{ color: '#003DA5' }}>💡 Tip:</strong> Use a Page Access Token (not User Token) for best results.
              </div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
            <div className="flex items-center mb-4">
              <MessageCircle className="text-green-600 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900" style={{ color: '#000000' }}>WhatsApp Chat Widget</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="whatsapp_enabled"
                    checked={settings.whatsapp_enabled === 'true'}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_enabled: e.target.checked ? 'true' : 'false' }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="font-semibold text-gray-900" style={{ color: '#000000' }}>Enable WhatsApp Chat Widget</span>
                </label>
                <p className="text-xs text-gray-800 ml-6 font-medium" style={{ color: '#000000' }}>Show floating WhatsApp button on all pages</p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <Phone size={16} className="text-green-600" />
                  WhatsApp Business Number
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="447123456789 (UK: 44 + number without leading 0)"
                  disabled={settings.whatsapp_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Include country code, no spaces or symbols (e.g., 447xxxxxxxxx for UK)
                </p>
              </div>

              <div>
                <label className="label flex items-center gap-2 text-gray-900 font-semibold" style={{ color: '#000000' }}>
                  <MessageCircle size={16} className="text-green-600" />
                  Default Chat Message
                </label>
                <textarea
                  name="whatsapp_default_message"
                  value={settings.whatsapp_default_message}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows="2"
                  placeholder="Hi! I'd like to know more about your quiz nights."
                  disabled={settings.whatsapp_enabled !== 'true'}
                />
                <p className="text-xs text-gray-800 mt-1 font-medium" style={{ color: '#000000' }}>
                  Pre-filled message when customers click to chat
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded text-xs font-medium text-gray-900 border border-green-400" style={{ color: '#000000' }}>
                <strong className="text-green-700" style={{ color: '#15803d' }}>✅ Easy Setup:</strong> No API keys needed! Just enter your WhatsApp number and enable.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex items-center px-8"
          >
            {submitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
