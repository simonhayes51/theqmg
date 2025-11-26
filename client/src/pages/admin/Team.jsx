import { useEffect, useState } from 'react';
import { teamAPI } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Mail, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    email: '',
    specialties: [],
    image: null,
    image_url: ''
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAll();
      setTeam(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading team:', error);
      showMessage('Failed to load team members. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      email: '',
      specialties: [],
      image: null,
      image_url: ''
    });
    setSpecialtyInput('');
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      email: member.email || '',
      specialties: Array.isArray(member.specialties) ? member.specialties : [],
      image: null,
      image_url: member.image_url || '',
      display_order: member.display_order || 0,
      is_active: member.is_active !== false
    });
    setSpecialtyInput('');
    setImagePreview(member.image_url ? `${API_BASE_URL}${member.image_url}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      email: '',
      specialties: [],
      image: null,
      image_url: ''
    });
    setSpecialtyInput('');
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

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const moveSpecialty = (index, direction) => {
    const newSpecialties = [...formData.specialties];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSpecialties.length) {
      [newSpecialties[index], newSpecialties[newIndex]] = [newSpecialties[newIndex], newSpecialties[index]];
      setFormData(prev => ({ ...prev, specialties: newSpecialties }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      showMessage('Please fill in the team member name (required field)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('role', formData.role || '');
      submitData.append('bio', formData.bio || '');
      submitData.append('email', formData.email || '');
      // Always send specialties, even if empty array
      submitData.append('specialties', JSON.stringify(formData.specialties));
      // Include display_order and is_active when editing
      if (editingMember) {
        submitData.append('display_order', formData.display_order || editingMember.display_order || 0);
        submitData.append('is_active', formData.is_active !== false);
      }
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (editingMember && formData.image_url) {
        // When editing without new image, send existing image_url
        submitData.append('image_url', formData.image_url);
      }

      if (editingMember) {
        await teamAPI.update(editingMember.id, submitData);
        showMessage('✅ Team member updated successfully!', 'success');
      } else {
        await teamAPI.create(submitData);
        showMessage('✅ Team member created successfully!', 'success');
      }

      closeModal();
      loadTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      showMessage('❌ Failed to save team member. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to delete "${member.name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await teamAPI.delete(member.id);
      showMessage('✅ Team member deleted successfully!', 'success');
      loadTeam();
    } catch (error) {
      console.error('Error deleting team member:', error);
      showMessage('❌ Failed to delete team member. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Team</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Team</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add Team Member
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
          <strong>💡 Tip:</strong> Add your quizmasters and team members here. They'll appear on your Team page. Upload a photo to make profiles more personal!
        </p>
      </div>

      {/* Team Grid */}
      {team.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Team Members Yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first team member!</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add Your First Team Member
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.id} className="card hover:shadow-xl transition-all duration-300">
                {/* Profile Image */}
                {member.image_url ? (
                  <img
                    src={`${API_BASE_URL}${member.image_url}`}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-quiz-blue"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-britpop flex items-center justify-center text-white text-4xl font-heading border-4 border-quiz-blue">
                    {member.name?.charAt(0) || '?'}
                  </div>
                )}

                {/* Name */}
                <h3 className="text-xl font-heading mb-2 text-quiz-blue text-center">
                  {member.name}
                </h3>

                {/* Role */}
                {member.role && (
                  <p className="text-quiz-red font-semibold mb-2 text-center uppercase tracking-wide text-sm">
                    {member.role}
                  </p>
                )}

                {/* Bio */}
                {member.bio && (
                  <p className="text-gray-700 text-sm mb-3 text-center line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Specialties */}
                {member.specialties && member.specialties.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-quiz-gray text-quiz-blue text-xs font-semibold rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email */}
                {member.email && (
                  <div className="mb-4 text-center">
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center text-quiz-blue hover:text-quiz-navy text-sm"
                    >
                      <Mail size={14} className="mr-1" />
                      {member.email}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center text-sm"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center text-sm"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Total: {team.length} team member{team.length !== 1 ? 's' : ''}</p>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-heading text-quiz-blue">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Name */}
              <div className="mb-4">
                <label className="label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., John Smith"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The team member's full name</p>
              </div>

              {/* Role */}
              <div className="mb-4">
                <label className="label">Role / Title</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Lead Quizmaster"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Their role or job title</p>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="label">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="textarea w-full"
                  placeholder="Tell people about this team member..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Optional: A short biography or description</p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., john@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Contact email (will be displayed publicly)</p>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <label className="label">Specialties / Skills</label>

                {/* Add Specialty Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    className="input flex-1"
                    placeholder="e.g., Music Trivia"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="btn btn-outline px-4"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Specialties List */}
                {formData.specialties.length > 0 && (
                  <div className="border-2 border-gray-200 rounded p-3 space-y-2">
                    {formData.specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                      >
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveSpecialty(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSpecialty(index, 'down')}
                            disabled={index === formData.specialties.length - 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                        <span className="flex-1 text-sm">{specialty}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add tags for their areas of expertise
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="label">Profile Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-quiz-blue" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                        className="absolute top-0 right-1/2 translate-x-16 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">Click to upload a photo</p>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="team-image-upload"
                  />
                  <label
                    htmlFor="team-image-upload"
                    className="inline-block mt-3 px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
                  >
                    Choose Photo
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional: Add a professional photo</p>
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
                      {editingMember ? 'Update Team Member' : 'Add Team Member'}
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

export default AdminTeam;
