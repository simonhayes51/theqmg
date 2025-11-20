import { useEffect, useState } from 'react';
import { recurringEventsAPI, venuesAPI } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, X, Save, RefreshCw, Play } from 'lucide-react';

const RecurringEventsAdmin = () => {
  const [recurringEvents, setRecurringEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'quiz',
    venue_id: '',
    recurrence_type: 'weekly',
    day_of_week: '',
    week_of_month: '',
    day_of_month: '',
    event_time: '19:00',
    start_date: '',
    end_date: '',
    generate_weeks_ahead: '12',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const weekOfMonth = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: 5, label: '5th' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recurringRes, venuesRes] = await Promise.all([
        recurringEventsAPI.getAll(),
        venuesAPI.getAll()
      ]);
      setRecurringEvents(Array.isArray(recurringRes.data) ? recurringRes.data : []);
      setVenues(Array.isArray(venuesRes.data) ? venuesRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Failed to load recurring events. Please refresh the page.', 'error');
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
      venue_id: '',
      recurrence_type: 'weekly',
      day_of_week: '',
      week_of_month: '',
      day_of_month: '',
      event_time: '19:00',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      generate_weeks_ahead: '12',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'quiz',
      venue_id: event.venue_id || '',
      recurrence_type: event.recurrence_type || 'weekly',
      day_of_week: event.day_of_week !== null ? event.day_of_week.toString() : '',
      week_of_month: event.week_of_month !== null ? event.week_of_month.toString() : '',
      day_of_month: event.day_of_month !== null ? event.day_of_month.toString() : '',
      event_time: event.event_time || '19:00',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      generate_weeks_ahead: event.generate_weeks_ahead?.toString() || '12',
      is_active: event.is_active !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        venue_id: formData.venue_id || null,
        recurrence_type: formData.recurrence_type,
        day_of_week: formData.day_of_week !== '' ? parseInt(formData.day_of_week) : null,
        week_of_month: formData.week_of_month !== '' ? parseInt(formData.week_of_month) : null,
        day_of_month: formData.day_of_month !== '' ? parseInt(formData.day_of_month) : null,
        event_time: formData.event_time,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        generate_weeks_ahead: parseInt(formData.generate_weeks_ahead),
        is_active: formData.is_active
      };

      if (editingEvent) {
        await recurringEventsAPI.update(editingEvent.id, submitData);
        showMessage('Recurring event updated successfully');
      } else {
        await recurringEventsAPI.create(submitData);
        showMessage('Recurring event created successfully');
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving recurring event:', error);
      showMessage(error.response?.data?.message || 'Failed to save recurring event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring event? This will not delete already generated events.')) return;

    try {
      await recurringEventsAPI.delete(id);
      showMessage('Recurring event deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting recurring event:', error);
      showMessage('Failed to delete recurring event', 'error');
    }
  };

  const handleGenerate = async (id) => {
    if (!confirm('Generate events from this template? This will create new events based on the recurrence pattern.')) return;

    try {
      const response = await recurringEventsAPI.generate(id);
      showMessage(response.data.message);
      loadData();
    } catch (error) {
      console.error('Error generating events:', error);
      showMessage(error.response?.data?.message || 'Failed to generate events', 'error');
    }
  };

  const formatRecurrencePattern = (event) => {
    const dayName = event.day_of_week !== null ? daysOfWeek[event.day_of_week].label : '';

    if (event.recurrence_type === 'weekly') {
      return `Every ${dayName}`;
    } else if (event.recurrence_type === 'biweekly') {
      return `Every other ${dayName}`;
    } else if (event.recurrence_type === 'monthly') {
      if (event.day_of_month) {
        return `Monthly on the ${event.day_of_month}${getOrdinalSuffix(event.day_of_month)}`;
      } else if (event.week_of_month && event.day_of_week !== null) {
        return `${weekOfMonth.find(w => w.value === event.week_of_month)?.label} ${dayName} of every month`;
      }
    }
    return event.recurrence_type;
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qmg-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-qmg-cream py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-qmg-blue font-impact">Recurring Events</h1>
            <p className="text-gray-600 mt-2">Manage recurring event templates and auto-generate events</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-qmg-red text-white px-6 py-3 rounded-md hover:bg-qmg-blue transition"
          >
            <Plus size={20} />
            Add Recurring Event
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recurringEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No recurring events yet. Create one to start auto-generating events!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-qmg-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Venue</th>
                    <th className="px-6 py-3 text-left">Pattern</th>
                    <th className="px-6 py-3 text-left">Time</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.event_type}</div>
                      </td>
                      <td className="px-6 py-4">{event.venue_name || 'No venue'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{formatRecurrencePattern(event)}</div>
                        <div className="text-xs text-gray-500">
                          Generates {event.generate_weeks_ahead} weeks ahead
                        </div>
                      </td>
                      <td className="px-6 py-4">{event.event_time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleGenerate(event.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Generate events"
                          >
                            <Play size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-qmg-blue">
                {editingEvent ? 'Edit Recurring Event' : 'Add Recurring Event'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="e.g., Weekly Quiz Night"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Event description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="quiz">Quiz Night</option>
                    <option value="race-night">Race Night</option>
                    <option value="special">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <select
                    name="venue_id"
                    value={formData.venue_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="">No venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Recurrence Pattern</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Recurrence Type *</label>
                    <select
                      name="recurrence_type"
                      value={formData.recurrence_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {(formData.recurrence_type === 'weekly' || formData.recurrence_type === 'biweekly') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Day of Week *</label>
                      <select
                        name="day_of_week"
                        value={formData.day_of_week}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="">Select a day</option>
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.recurrence_type === 'monthly' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Choose either a fixed day of month OR a specific weekday:</p>

                      <div>
                        <label className="block text-sm font-medium mb-2">Day of Month (e.g., 15th)</label>
                        <input
                          type="number"
                          name="day_of_month"
                          value={formData.day_of_month}
                          onChange={handleInputChange}
                          min="1"
                          max="31"
                          className="w-full px-4 py-2 border rounded-md"
                          placeholder="1-31"
                        />
                      </div>

                      <div className="text-center text-gray-500">OR</div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Week of Month</label>
                          <select
                            name="week_of_month"
                            value={formData.week_of_month}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-md"
                          >
                            <option value="">Select week</option>
                            {weekOfMonth.map(week => (
                              <option key={week.value} value={week.value}>{week.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Day of Week</label>
                          <select
                            name="day_of_week"
                            value={formData.day_of_week}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-md"
                          >
                            <option value="">Select day</option>
                            {daysOfWeek.map(day => (
                              <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Event Time *</label>
                    <input
                      type="time"
                      name="event_time"
                      value={formData.event_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Generation Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Generate Weeks Ahead</label>
                  <input
                    type="number"
                    name="generate_weeks_ahead"
                    value={formData.generate_weeks_ahead}
                    onChange={handleInputChange}
                    min="1"
                    max="52"
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="12"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many weeks in advance to auto-generate events</p>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Active (generate events automatically)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-qmg-red text-white px-6 py-3 rounded-md hover:bg-qmg-blue transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {submitting ? 'Saving...' : (editingEvent ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border rounded-md hover:bg-gray-50"
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

export default RecurringEventsAdmin;
