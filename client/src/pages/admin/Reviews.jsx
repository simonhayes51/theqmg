import { useEffect, useState } from 'react';
import { reviewsAPI } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    author_name: '',
    rating: 5,
    review_text: '',
    is_featured: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getAll();
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showMessage('Failed to load reviews. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormData({
      author_name: '',
      rating: 5,
      review_text: '',
      is_featured: false
    });
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setFormData({
      author_name: review.author_name || '',
      rating: review.rating || 5,
      review_text: review.review_text || '',
      is_featured: review.is_featured || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData({
      author_name: '',
      rating: 5,
      review_text: '',
      is_featured: false
    });
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

    if (!formData.author_name || !formData.review_text) {
      showMessage('Please fill in all required fields (Name and Review)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        author_name: formData.author_name,
        rating: parseInt(formData.rating),
        review_text: formData.review_text,
        is_featured: formData.is_featured
      };

      if (editingReview) {
        await reviewsAPI.update(editingReview.id, submitData);
        showMessage('✅ Review updated successfully!', 'success');
      } else {
        await reviewsAPI.create(submitData);
        showMessage('✅ Review created successfully!', 'success');
      }

      closeModal();
      loadReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      showMessage('❌ Failed to save review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm(`Are you sure you want to delete the review by "${review.author_name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await reviewsAPI.delete(review.id);
      showMessage('✅ Review deleted successfully!', 'success');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      showMessage('❌ Failed to delete review. Please try again.', 'error');
    }
  };

  const toggleFeatured = async (review) => {
    try {
      await reviewsAPI.update(review.id, {
        ...review,
        is_featured: !review.is_featured
      });
      showMessage(`Review ${!review.is_featured ? 'featured' : 'unfeatured'} successfully!`, 'success');
      loadReviews();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showMessage('❌ Failed to update featured status.', 'error');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
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
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Reviews</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Reviews</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Review
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
          <strong>💡 Tip:</strong> Add customer testimonials here. Featured reviews appear on your homepage. Click the star icon to feature/unfeature a review.
        </p>
      </div>

      {/* Reviews Table */}
      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Reviews Yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first customer review!</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add Your First Review
          </button>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-quiz-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-quiz-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Review</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr key={review.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-quiz-blue">{review.author_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 line-clamp-2 max-w-md">
                        {review.review_text}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {formatDate(review.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(review)}
                        className={`p-2 rounded transition-colors ${
                          review.is_featured
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={review.is_featured ? 'Click to unfeature' : 'Click to feature'}
                      >
                        <Star
                          size={20}
                          className={review.is_featured ? 'fill-yellow-600' : ''}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(review)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review)}
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
            <p className="text-sm text-gray-600">
              Total: {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              {reviews.filter(r => r.is_featured).length > 0 && (
                <span className="ml-4">
                  • {reviews.filter(r => r.is_featured).length} featured
                </span>
              )}
            </p>
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
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Customer Name */}
              <div className="mb-4">
                <label className="label">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., John Smith"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The name of the person giving the review</p>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="label">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className={
                          star <= parseInt(formData.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">How many stars did the customer give?</p>
              </div>

              {/* Review Text */}
              <div className="mb-4">
                <label className="label">
                  Review Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="review_text"
                  value={formData.review_text}
                  onChange={handleInputChange}
                  rows="5"
                  className="textarea w-full"
                  placeholder="What did the customer say about your service..."
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">The customer's feedback or testimonial</p>
              </div>

              {/* Featured */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-quiz-blue rounded border-gray-300 focus:ring-quiz-blue mr-3"
                  />
                  <div>
                    <span className="font-semibold">Feature on Homepage</span>
                    <p className="text-xs text-gray-500">
                      Featured reviews appear on your homepage to showcase customer satisfaction
                    </p>
                  </div>
                </label>
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
                      {editingReview ? 'Update Review' : 'Create Review'}
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

export default AdminReviews;
