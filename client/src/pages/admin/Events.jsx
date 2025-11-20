import { useEffect, useState } from 'react';
import { eventsAPI, venuesAPI } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, MapPin, X, Save, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'quiz',
    event_date: '',
    event_time: '',
    venue_id: '',
    status: 'scheduled',
    image: null,
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, venuesRes] = await Promise.all([
        eventsAPI.getAll(),
        venuesAPI.getAll()
      ]);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setVenues(Array.isArray(venuesRes.data) ? venuesRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Failed to load events. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'quiz',
      event_date: '',
      event_time: '',
      venue_id: '',
      status: 'scheduled',
      image: null,
      image_url: ''
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'quiz',
      event_date: event.event_date ? event.event_date.split('T')[0] : '',
      event_time: event.event_time || '',
      venue_id: event.venue_id || '',
      status: event.status || 'scheduled',
      image: null,
      image_url: event.image_url || ''
    });
    setImagePreview(event.image_url ? `${API_BASE_URL}${event.image_url}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'quiz',
      event_date: '',
      event_time: '',
      venue_id: '',
      status: 'scheduled',
      image: null,
      image_url: ''
    });
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.event_date) {
      showMessage('Please fill in all required fields (Title and Date)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('event_type', formData.event_type);
      submitData.append('event_date', formData.event_date);
      submitData.append('event_time', formData.event_time || '');
      submitData.append('status', formData.status);
      if (formData.venue_id) {
        submitData.append('venue_id', formData.venue_id);
      }
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (editingEvent && formData.image_url) {
        // When editing without new image, send existing image_url
        submitData.append('image_url', formData.image_url);
      }

      if (editingEvent) {
        await eventsAPI.update(editingEvent.id, submitData);
        showMessage('✅ Event updated successfully!', 'success');
      } else {
        await eventsAPI.create(submitData);
        showMessage('✅ Event created successfully!', 'success');
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving event:', error);
      showMessage('❌ Failed to save event. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await eventsAPI.delete(event.id);
      showMessage('✅ Event deleted successfully!', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting event:', error);
      showMessage('❌ Failed to delete event. Please try again.', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Events</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Events</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Event
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded border-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded p-4 mb-6">
        <p className="text-blue-800">
          <strong>💡 Tip:</strong> Click "Add New Event" to create a quiz night or special event. You can upload an image, set the date, and choose a venue.
        </p>
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Events Yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first event!</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add Your First Event
          </button>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-quiz-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-quiz-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Event Title</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Venue</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      {event.image_url ? (
                        <img
                          src={`${API_BASE_URL}${event.image_url}`}
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Calendar size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-quiz-blue">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-gray-600 line-clamp-1">{event.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(event.event_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {event.venue_name ? (
                        <div className="flex items-center text-gray-700">
                          <MapPin size={16} className="mr-2" />
                          {event.venue_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">No venue</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center text-sm"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">Total: {events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-heading text-quiz-blue">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Title */}
              <div className="mb-4">
                <label className="label">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Weekly Quiz Night"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This is the main name of your event</p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="textarea w-full"
                  placeholder="Tell people what makes this event special..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Optional: Add details about the event</p>
              </div>

              {/* Date */}
              <div className="mb-4">
                <label className="label">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">When will this event take place?</p>
              </div>

              {/* Venue */}
              <div className="mb-4">
                <label className="label">Venue</label>
                <select
                  name="venue_id"
                  value={formData.venue_id}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="">No venue (or TBA)</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select a venue or leave blank
                  {venues.length === 0 && ' (Add venues in the Venues section first)'}
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="label">Event Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">Click to upload an image</p>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block mt-3 px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
                  >
                    Choose Image
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional: Add a photo to make your event more appealing</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex items-center flex-1"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
