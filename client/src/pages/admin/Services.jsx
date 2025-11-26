import { useEffect, useState } from 'react';
import { servicesAPI } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    features: [],
    display_order: 0,
    is_active: true
  });
  const [featureInput, setFeatureInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading services:', error);
      showMessage('Failed to load services. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      features: [],
      display_order: 0,
      is_active: true
    });
    setFeatureInput('');
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
      features: Array.isArray(service.features) ? service.features : [],
      display_order: service.display_order || 0,
      is_active: service.is_active !== false
    });
    setFeatureInput('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      features: [],
      display_order: 0,
      is_active: true
    });
    setFeatureInput('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const moveFeature = (index, direction) => {
    const newFeatures = [...formData.features];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newFeatures.length) {
      [newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]];
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      showMessage('Please fill in all required fields (Title and Description)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon || null,
        features: formData.features.length > 0 ? formData.features : null,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active !== false
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, submitData);
        showMessage('✅ Service updated successfully!', 'success');
      } else {
        await servicesAPI.create(submitData);
        showMessage('✅ Service created successfully!', 'success');
      }

      closeModal();
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      showMessage('❌ Failed to save service. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.title}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await servicesAPI.delete(service.id);
      showMessage('✅ Service deleted successfully!', 'success');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      showMessage('❌ Failed to delete service. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Services</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Services</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Service
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
          <strong>💡 Tip:</strong> Services are shown on your homepage. Add features to make each service more appealing. Use emojis for icons (e.g., 🎤, 🎯, 🏆).
        </p>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Services Yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first service!</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-quiz-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-quiz-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Icon</th>
                  <th className="px-4 py-3 text-left">Service Title</th>
                  <th className="px-4 py-3 text-left">Features</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="text-3xl">{service.icon || '📋'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-quiz-blue">{service.title}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600 line-clamp-2">{service.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {service.features && service.features.length > 0 ? (
                        <div className="text-sm text-gray-600">
                          {service.features.length} feature{service.features.length !== 1 ? 's' : ''}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No features</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">{service.display_order || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
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
            <p className="text-sm text-gray-600">Total: {services.length} service{services.length !== 1 ? 's' : ''}</p>
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
                {editingService ? 'Edit Service' : 'Add New Service'}
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
                  Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Quiz Nights"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The main name of your service</p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="label">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="textarea w-full"
                  placeholder="Describe what makes this service special..."
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Explain what this service offers</p>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <label className="label">Icon (Emoji)</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., 🎤 or 🎯 or 🏆"
                  maxLength="4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add a fun emoji to represent this service
                </p>
              </div>

              {/* Display Order */}
              <div className="mb-6">
                <label className="label">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first (0 = first, 1 = second, etc.)
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <label className="label">Features</label>

                {/* Add Feature Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    className="input flex-1"
                    placeholder="e.g., Professional quizmaster included"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn btn-outline px-4"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Features List */}
                {formData.features.length > 0 && (
                  <div className="border-2 border-gray-200 rounded p-3 space-y-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                      >
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveFeature(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFeature(index, 'down')}
                            disabled={index === formData.features.length - 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                        <span className="flex-1 text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add bullet points highlighting what's included
                </p>
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
                      {editingService ? 'Update Service' : 'Create Service'}
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

export default AdminServices;
