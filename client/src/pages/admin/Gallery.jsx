import { useEffect, useState } from 'react';
import { galleryAPI } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    image_url: '',
    display_order: 0
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll();
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading gallery:', error);
      showMessage('Failed to load gallery images. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: null,
      image_url: '',
      display_order: 0
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      category: image.category || '',
      image: null,
      image_url: image.image_url || '',
      display_order: image.display_order || 0
    });
    setImagePreview(image.image_url ? `${API_BASE_URL}${image.image_url}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: null,
      image_url: '',
      display_order: 0
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // For editing mode, use single file
    if (editingImage) {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }

    // For bulk upload mode, handle multiple files
    setSelectedFiles(files);

    // Create previews for all files
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push({ file, preview: reader.result, index });
        if (previews.length === files.length) {
          // Sort by index to maintain order
          previews.sort((a, b) => a.index - b.index);
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for bulk upload mode
    if (!editingImage && selectedFiles.length === 0) {
      showMessage('Please select at least one image to upload', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Handle single image edit
      if (editingImage) {
        const submitData = new FormData();
        submitData.append('title', formData.title || '');
        submitData.append('description', formData.description || '');
        submitData.append('category', formData.category || '');
        submitData.append('display_order', formData.display_order || editingImage.display_order || 0);
        if (formData.image) {
          submitData.append('image', formData.image);
        } else if (formData.image_url) {
          // When editing without new image, send existing image_url
          submitData.append('image_url', formData.image_url);
        }

        await galleryAPI.update(editingImage.id, submitData);
        showMessage('✅ Image updated successfully!', 'success');
      } else {
        // Handle bulk upload
        let successCount = 0;
        let failCount = 0;

        for (const file of selectedFiles) {
          try {
            const submitData = new FormData();
            submitData.append('title', formData.title || '');
            submitData.append('description', formData.description || '');
            submitData.append('category', formData.category || '');
            submitData.append('image', file);

            console.log('Uploading file:', file.name);
            const response = await galleryAPI.upload(submitData);
            console.log('Upload response:', response.data);
            successCount++;
          } catch (err) {
            console.error('Error uploading file:', file.name, err);
            console.error('Error response:', err.response?.data);
            failCount++;
          }
        }

        if (failCount === 0) {
          showMessage(`✅ ${successCount} image${successCount !== 1 ? 's' : ''} uploaded successfully!`, 'success');
        } else if (successCount === 0) {
          showMessage(`❌ Failed to upload all ${failCount} image${failCount !== 1 ? 's' : ''}. Please try again.`, 'error');
        } else {
          showMessage(`⚠️ ${successCount} image${successCount !== 1 ? 's' : ''} uploaded, ${failCount} failed.`, 'error');
        }
      }

      closeModal();
      loadImages();
    } catch (error) {
      console.error('Error saving image:', error);
      showMessage('❌ Failed to save image. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (image) => {
    const displayName = image.title || 'this image';
    if (!window.confirm(`Are you sure you want to delete "${displayName}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await galleryAPI.delete(image.id);
      showMessage('✅ Image deleted successfully!', 'success');
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      showMessage('❌ Failed to delete image. Please try again.', 'error');
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(images.map(img => img.category).filter(Boolean))];

  // Filter images
  const filteredImages = images.filter(image => {
    return filterCategory === 'all' || image.category === filterCategory;
  });

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Manage Gallery</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Manage Gallery</h1>
        <button onClick={openAddModal} className="btn btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Upload Image
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
          <strong>💡 Tip:</strong> Upload photos from your events to showcase your work. You can upload multiple images at once! Use categories to organize images (e.g., "Quiz Nights", "Special Events", "Team Photos").
        </p>
      </div>

      {/* Category Filter */}
      {images.length > 0 && categories.length > 1 && (
        <div className="mb-6">
          <label className="label">Filter by Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input max-w-xs"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">
            {filterCategory !== 'all' ? 'No Images in This Category' : 'No Images Yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filterCategory !== 'all'
              ? 'Try selecting a different category'
              : 'Get started by uploading your first image!'}
          </p>
          {filterCategory === 'all' ? (
            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={20} className="inline mr-2" />
              Upload Your First Image
            </button>
          ) : (
            <button
              onClick={() => setFilterCategory('all')}
              className="btn btn-outline"
            >
              Show All Images
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="card group relative overflow-hidden p-0 hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${image.image_url}`}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(image)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(image)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Info */}
                {(image.title || image.category) && (
                  <div className="p-3">
                    {image.title && (
                      <h4 className="font-semibold text-quiz-blue text-sm mb-1 line-clamp-1">
                        {image.title}
                      </h4>
                    )}
                    {image.category && (
                      <span className="text-xs bg-quiz-gray text-quiz-blue px-2 py-1 rounded-full">
                        {image.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredImages.length} of {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
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
                {editingImage ? 'Edit Image' : 'Upload Image'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Image Upload */}
              <div className="mb-6">
                <label className="label">
                  Image{!editingImage && 's'} {!editingImage && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {/* Single image preview for editing */}
                  {editingImage && imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
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
                  ) : !editingImage && imagePreviews.length > 0 ? (
                    /* Multiple image previews for bulk upload */
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((item, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={item.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">
                        {editingImage ? 'Click to upload an image' : 'Click to upload images (multiple allowed)'}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB each)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="gallery-image-upload"
                    multiple={!editingImage}
                  />
                  <label
                    htmlFor="gallery-image-upload"
                    className="inline-block mt-3 px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
                  >
                    {editingImage ? (imagePreview ? 'Change Image' : 'Choose Image') :
                     (imagePreviews.length > 0 ? `${imagePreviews.length} Selected - Choose More` : 'Choose Images')}
                  </label>
                </div>
                {editingImage ? (
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing image</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {imagePreviews.length > 0
                      ? `${imagePreviews.length} image${imagePreviews.length !== 1 ? 's' : ''} selected for upload. You can select more or remove unwanted images.`
                      : 'Select one or more images to upload. You can select multiple files at once.'}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Quiz Night at The Red Lion"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Add a descriptive title</p>
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
                  placeholder="Tell people about this photo..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Optional: Add more details about the photo</p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="label">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Quiz Nights"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Optional: Group images by category (e.g., "Quiz Nights", "Team Photos")</p>
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
                      {editingImage ? 'Saving...' : `Uploading ${selectedFiles.length} image${selectedFiles.length !== 1 ? 's' : ''}...`}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {editingImage ? 'Update Image' : `Upload ${selectedFiles.length || 0} Image${selectedFiles.length !== 1 ? 's' : ''}`}
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

export default AdminGallery;
