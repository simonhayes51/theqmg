import { useState, useEffect } from 'react';
import { contactAPI, settingsAPI } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    }
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
    <div className="min-h-screen bg-quiz-gray">
      {/* Hero Section */}
      <section className="bg-gradient-britpop text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-6xl font-heading mb-4">{settings.contact_page_title || 'Get In Touch'}</h1>
          <p className="text-xl">{settings.contact_page_subtitle || "Let's discuss how we can bring entertainment to your venue"}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="card bg-white sticky top-24">
                <h2 className="text-2xl font-heading mb-6 text-quiz-blue">Contact Information</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-quiz-blue text-white p-3 rounded-lg mr-4">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <a href="tel:+441234567890" className="text-gray-600 hover:text-quiz-blue">
                        +44 (0) 1234 567890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-quiz-blue text-white p-3 rounded-lg mr-4">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a href="mailto:info@quizmastergeneral.co.uk" className="text-gray-600 hover:text-quiz-blue break-all">
                        info@quizmastergeneral.co.uk
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-quiz-blue text-white p-3 rounded-lg mr-4">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-gray-600">
                        Serving venues across<br />
                        North East England
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-heading text-lg mb-4 text-quiz-blue">Quick Response</h3>
                  <p className="text-gray-600 text-sm">
                    We typically respond to inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card bg-white">
                <h2 className="text-2xl font-heading mb-6 text-quiz-blue">Send Us a Message</h2>

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded flex items-start">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={24} />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-1">Message Sent!</h3>
                      <p className="text-green-700 text-sm">
                        Thank you for contacting us. We'll get back to you as soon as possible.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Name */}
                    <div>
                      <label className="label">
                        Name <span className="text-quiz-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="label">
                        Email <span className="text-quiz-red">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Phone */}
                    <div>
                      <label className="label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input w-full ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="+44 1234 567890"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="label">
                        Subject <span className="text-quiz-red">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`input w-full ${errors.subject ? 'border-red-500' : ''}`}
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
                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="label">
                      Message <span className="text-quiz-red">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className={`textarea w-full ${errors.message ? 'border-red-500' : ''}`}
                      placeholder="Tell us about your venue, preferred dates, and what you're looking for..."
                    ></textarea>
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {formData.message.length} characters (minimum 10)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full md:w-auto px-8 flex items-center justify-center"
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
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading mb-4 text-quiz-blue">What Happens Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl mb-3">📧</div>
                <h3 className="font-heading mb-2">1. We'll Review</h3>
                <p className="text-gray-600 text-sm">We'll review your inquiry and gather any additional information we need</p>
              </div>
              <div>
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-heading mb-2">2. We'll Contact You</h3>
                <p className="text-gray-600 text-sm">We'll reach out within 24 hours to discuss your requirements</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-heading mb-2">3. Let's Get Started</h3>
                <p className="text-gray-600 text-sm">We'll arrange everything for an amazing event at your venue</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
