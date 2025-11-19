import { useEffect, useState } from 'react';
import { galleryAPI } from '../services/api';
import { X, Search, Filter } from 'lucide-react';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await galleryAPI.getAll();
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading gallery:', error);
      setError('Failed to load gallery images. Please try again later.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(images.map(img => img.category).filter(Boolean))];

  // Filter images
  const filteredImages = images.filter(image => {
    const matchesSearch = !searchTerm ||
      image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || image.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Lightbox handlers
  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, filteredImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-quiz-gray">
        <div className="bg-gradient-britpop text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Gallery</h1>
            <p className="text-xl">Loading amazing memories...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-300 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-quiz-gray flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-quiz-red">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={loadImages} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-gray">
      {/* Hero Section */}
      <section className="bg-gradient-britpop text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-6xl font-heading mb-4">Gallery</h1>
          <p className="text-xl">Memories from our amazing events</p>
        </div>
      </section>

      {/* Search and Filters */}
      {images.length > 0 && (
        <section className="bg-white border-b-2 border-quiz-blue py-6">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input pl-10 w-full"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="section">
        <div className="container-custom">
          {filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-heading mb-2 text-quiz-blue">
                {searchTerm || filterCategory !== 'all' ? 'No Matching Images' : 'No Images Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for photos from our events!'}
              </p>
              {(searchTerm || filterCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Showing {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded border-2 border-transparent hover:border-quiz-blue transition-all duration-300"
                    onClick={() => openLightbox(image)}
                  >
                    <img
                      src={`${API_BASE_URL}${image.image_url}`}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white w-full">
                        {image.title && (
                          <h3 className="font-heading text-sm mb-1">{image.title}</h3>
                        )}
                        {image.category && (
                          <span className="text-xs bg-quiz-red px-2 py-1 rounded">
                            {image.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-quiz-red transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Navigation Buttons */}
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-quiz-blue text-4xl font-bold z-10"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-quiz-blue text-4xl font-bold z-10"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${API_BASE_URL}${selectedImage.image_url}`}
              alt={selectedImage.title || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="bg-white p-4 mt-4 rounded">
                {selectedImage.title && (
                  <h3 className="text-xl font-heading text-quiz-blue mb-2">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-gray-700">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 text-white text-sm text-center">
            <p>Use arrow keys or click arrows to navigate • Press ESC or click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
