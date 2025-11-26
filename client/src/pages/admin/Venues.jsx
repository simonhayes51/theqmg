import { useEffect, useState } from 'react';
import { venuesAPI } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, MapPin, Phone, Mail, Upload, Image as ImageIcon } from 'lucide-react';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    capacity: '',
    latitude: '',
    longitude: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const response = await venuesAPI.getAll();
      setVenues(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading venues:', error);
      showMessage('Failed to load venues. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      capacity: '',
      latitude: '',
      longitude: '',
      image: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      address: venue.address || '',
      city: venue.city || '',
      postcode: venue.postcode || '',
      phone: venue.phone || '',
      email: venue.email || '',
      website: venue.website || '',
      description: venue.description || '',
      capacity: venue.capacity || '',
      latitude: venue.latitude || '',
      longitude: venue.longitude || '',
      image: null,
      image_url: venue.image_url || null
    });
    setImagePreview(venue.image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${venue.image_url}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVenue(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      capacity: '',
      latitude: '',
      longitude: '',
      image: null
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      showMessage('Please fill in the venue name (required field)', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Use FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address', formData.address || '');
      submitData.append('city', formData.city || '');
      submitData.append('postcode', formData.postcode || '');
      submitData.append('phone', formData.phone || '');
      submitData.append('email', formData.email || '');
      submitData.append('website', formData.website || '');
      submitData.append('description', formData.description || '');
      submitData.append('capacity', formData.capacity || '');
      submitData.append('latitude', formData.latitude || '');
      submitData.append('longitude', formData.longitude || '');

      // Add image if new file selected, otherwise keep existing image_url
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      if (editingVenue) {
        await venuesAPI.update(editingVenue.id, submitData);
        showMessage('✅ Venue updated successfully!', 'success');
      } else {
        await venuesAPI.create(submitData);
        showMessage('✅ Venue created successfully!', 'success');
      }

      closeModal();
      loadVenues();
    } catch (error) {
      console.error('Error saving venue:', error);
      showMessage('❌ Failed to save venue. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (venue) => {
    if (!window.confirm(`Are you sure you want to delete "${venue.name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await venuesAPI.delete(venue.id);
      showMessage('✅ Venue deleted successfully!', 'success');
      loadVenues();
    } catch (error) {
      console.error('Error deleting venue:', error);
      showMessage('❌ Failed to delete venue. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Venues</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Venues</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Venue
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
          <strong>💡 Tip:</strong> Add your partner venues here. These venues will appear on your Venues page and can be linked to events.
        </p>
      </div>

      {/* Venues Table */}
      {venues.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Venues Yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first partner venue!</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add Your First Venue
          </button>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-quiz-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-quiz-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Venue Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Capacity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue, index) => (
                  <tr key={venue.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-quiz-blue">{venue.name}</div>
                      {venue.description && (
                        <div className="text-sm text-gray-600 line-clamp-1">{venue.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(venue.address || venue.city || venue.postcode) ? (
                        <div className="text-sm text-gray-700">
                          {venue.address && <div>{venue.address}</div>}
                          <div>
                            {venue.city}
                            {venue.city && venue.postcode && ', '}
                            {venue.postcode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No location</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm space-y-1">
                        {venue.phone && (
                          <div className="flex items-center text-gray-700">
                            <Phone size={14} className="mr-1" />
                            {venue.phone}
                          </div>
                        )}
                        {venue.email && (
                          <div className="flex items-center text-gray-700">
                            <Mail size={14} className="mr-1" />
                            <span className="truncate max-w-[200px]">{venue.email}</span>
                          </div>
                        )}
                        {!venue.phone && !venue.email && (
                          <span className="text-gray-400">No contact</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {venue.capacity ? (
                        <span className="text-gray-700">{venue.capacity}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(venue)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(venue)}
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
            <p className="text-sm text-gray-600">Total: {venues.length} venue{venues.length !== 1 ? 's' : ''}</p>
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
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Venue Name */}
              <div className="mb-4">
                <label className="label">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., The Red Lion"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The name of the pub, club, or venue</p>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., 123 High Street"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: The street address</p>
              </div>

              {/* City and Postcode */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">City/Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Newcastle"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
                <div>
                  <label className="label">Postcode</label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., NE1 1AA"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., 0191 123 4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., info@venue.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="textarea w-full"
                  placeholder="Tell people about this venue..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Optional: Add details about the venue</p>
              </div>

              {/* Capacity */}
              <div className="mb-4">
                <label className="label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., 100"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Maximum number of people the venue can hold</p>
              </div>

              {/* Map Coordinates */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex items-start mb-3">
                  <MapPin className="text-blue-600 mr-2 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Map Coordinates (Optional)</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Add coordinates to display this venue on the map. Find coordinates on{' '}
                      <a
                        href="https://www.google.com/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold hover:text-blue-600"
                      >
                        Google Maps
                      </a>
                      {' '}(right-click on location → click coordinates to copy)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="e.g., 54.978252"
                      step="0.000001"
                      min="-90"
                      max="90"
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="e.g., -1.61778"
                      step="0.000001"
                      min="-180"
                      max="180"
                    />
                  </div>
                </div>
              </div>

              {/* Venue Logo/Image */}
              <div className="mb-6">
                <label className="label">Venue Logo/Image</label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-48 border-2 border-gray-200 rounded overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null, image_url: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-quiz-blue hover:bg-blue-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-600">
                        <span className="text-quiz-blue font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF or WebP (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional: Add a logo or photo of the venue</p>
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
                      {editingVenue ? 'Update Venue' : 'Create Venue'}
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

export default AdminVenues;
