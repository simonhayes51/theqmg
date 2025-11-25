import { useState, useEffect } from 'react';
import { contactAPI, settingsAPI, socialMediaAPI } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Zap } from 'lucide-react';
import ScrollReveal from '../hooks/useScrollAnimation';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({});
  const [whatsappSettings, setWhatsappSettings] = useState({ enabled: false });

  useEffect(() => {
    loadSettings();
    loadWhatsAppSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadWhatsAppSettings = async () => {
    try {
      const response = await socialMediaAPI.getWhatsAppSettings();
      setWhatsappSettings(response.data);
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    }
  };

  const openWhatsApp = () => {
    // Clean phone number - remove spaces, dashes, parentheses, plus signs
    const cleanNumber = whatsappSettings.number.replace(/[\s\-\(\)\+]/g, '');
    const message = encodeURIComponent(whatsappSettings.defaultMessage || 'Hi! I\'d like to know more about your quiz nights.');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    console.log('Opening WhatsApp with URL:', whatsappUrl); // Debug log
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await contactAPI.submit(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <ScrollReveal animation="fade-down">
        <section className="hero-section" style={{
          background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)',
          minHeight: '40vh'
        }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{settings.contact_page_title || 'Get In Touch'}</h1>
            <p className="hero-subtitle">{settings.contact_page_subtitle || "Let's discuss how we can bring entertainment to your venue"}</p>
          </div>
        </section>
      </ScrollReveal>

      <section className="section bg-gray-950 py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="lg:col-span-1">
                <div className="service-card">
                  <h2 className="text-2xl font-heading mb-6 text-brit-gold">Contact Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-brit-navy text-white p-3 rounded-lg mr-4">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-gray-200">Phone</h3>
                        <a href="tel:+441234567890" className="text-gray-300 hover:text-brit-gold transition-colors">
                          +44 (0) 1234 567890
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-brit-navy text-white p-3 rounded-lg mr-4">
                        <Mail size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-gray-200">Email</h3>
                        <a href="mailto:info@quizmastergeneral.co.uk" className="text-gray-300 hover:text-brit-gold break-all transition-colors">
                          info@quizmastergeneral.co.uk
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-brit-navy text-white p-3 rounded-lg mr-4">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-gray-200">Location</h3>
                        <p className="text-gray-300">
                          Serving venues across<br />
                          North East England
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    {whatsappSettings.enabled && whatsappSettings.number && (
                      <div className="pt-6 mt-6 border-t border-gray-700">
                        <button
                          onClick={openWhatsApp}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg"
                        >
                          <MessageCircle size={24} />
                          <span>Chat on WhatsApp</span>
                        </button>
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Get instant responses via WhatsApp
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="font-heading text-lg mb-4 text-brit-gold">Quick Response</h3>
                    <p className="text-gray-300 text-sm">
                      We typically respond to inquiries within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="lg:col-span-2">
                <div className="service-card">
                  <h2 className="text-2xl font-heading mb-6 text-brit-gold">Send Us a Message</h2>

                  {success && (
                    <div className="mb-6 p-4 bg-green-900/30 border-2 border-green-500 rounded flex items-start">
                      <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={24} />
                      <div>
                        <h3 className="font-semibold text-green-400 mb-1">Message Sent!</h3>
                        <p className="text-green-300 text-sm">
                          Thank you for contacting us. We'll get back to you as soon as possible.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded">
                      <p className="text-red-300">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Name */}
                      <div>
                        <label className="label text-gray-200">
                          Name <span className="text-brit-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`input w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Your name"
                        />
                        {errors.name && (
                          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="label text-gray-200">
                          Email <span className="text-brit-red">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`input w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Phone */}
                      <div>
                        <label className="label text-gray-200">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`input w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder="+44 1234 567890"
                        />
                        {errors.phone && (
                          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="label text-gray-200">
                          Subject <span className="text-brit-red">*</span>
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`input w-full bg-gray-800 border-gray-700 text-gray-200 ${errors.subject ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select a subject</option>
                          <option value="Quiz Night Booking">Quiz Night Booking</option>
                          <option value="Race Night Booking">Race Night Booking</option>
                          <option value="Special Event">Special Event</option>
                          <option value="Partnership Inquiry">Partnership Inquiry</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.subject && (
                          <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label className="label text-gray-200">
                        Message <span className="text-brit-red">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={`textarea w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 ${errors.message ? 'border-red-500' : ''}`}
                        placeholder="Tell us about your venue, preferred dates, and what you're looking for..."
                      ></textarea>
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                      )}
                      <p className="text-gray-400 text-sm mt-1">
                        {formData.message.length} characters (minimum 10)
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full md:w-auto px-8 flex items-center justify-center hover:scale-105 transform transition-transform"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} className="mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <ScrollReveal animation="fade-up">
        <section className="section bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading mb-4 text-brit-gold">What Happens Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <ScrollReveal animation="scale-up" delay={0}>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                    <div className="text-4xl mb-3">📧</div>
                    <h3 className="font-heading mb-2 text-gray-200">1. We'll Review</h3>
                    <p className="text-gray-300 text-sm">We'll review your inquiry and gather any additional information we need</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal animation="scale-up" delay={100}>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                    <div className="text-4xl mb-3">📞</div>
                    <h3 className="font-heading mb-2 text-gray-200">2. We'll Contact You</h3>
                    <p className="text-gray-300 text-sm">We'll reach out within 24 hours to discuss your requirements</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal animation="scale-up" delay={200}>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-heading mb-2 text-gray-200">3. Let's Get Started</h3>
                    <p className="text-gray-300 text-sm">We'll arrange everything for an amazing event at your venue</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">Ready to Book?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              Fill out the form above or reach out directly to get started today!
            </p>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Contact;
