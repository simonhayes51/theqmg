import { useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';
import { Save, Building2, Phone, Mail, Clock, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Business Info
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_city: '',
    business_postcode: '',

    // Social Media
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',

    // Business Hours
    business_hours: '',

    // About
    about_text: '',
    tagline: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await settingsAPI.bulkUpdate(settings);
      showMessage('✅ Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('❌ Failed to save settings. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
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
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Site Settings</h1>
        <p className="text-gray-600 mt-2">Manage your business information and social media links</p>
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
        <div className="card mb-6">
          <div className="flex items-center mb-6">
            <Building2 className="text-quiz-blue mr-3" size={28} />
            <h2 className="text-2xl font-heading text-quiz-blue">Business Information</h2>
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

        {/* Business Hours */}
        <div className="card mb-6">
          <div className="flex items-center mb-6">
            <Clock className="text-quiz-blue mr-3" size={28} />
            <h2 className="text-2xl font-heading text-quiz-blue">Business Hours</h2>
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
        <div className="card mb-6">
          <div className="flex items-center mb-6">
            <Globe className="text-quiz-blue mr-3" size={28} />
            <h2 className="text-2xl font-heading text-quiz-blue">About Your Business</h2>
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
        <div className="card mb-6">
          <div className="flex items-center mb-6">
            <Globe className="text-quiz-blue mr-3" size={28} />
            <h2 className="text-2xl font-heading text-quiz-blue">Social Media Links</h2>
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

          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Social media links will appear in your website footer and contact sections. Leave blank to hide any social media icons you don't use.
            </p>
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
