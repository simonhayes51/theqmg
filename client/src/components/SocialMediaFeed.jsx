import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, RefreshCw } from 'lucide-react';
import { socialMediaAPI, settingsAPI } from '../services/api';

const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: '',
    facebook_url: '',
    twitter_url: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const response = await settingsAPI.getAll();
      // Response.data is an object { key: value }, not an array
      const settings = response.data;
      setSocialLinks({
        instagram_url: settings.instagram_url || 'https://instagram.com',
        facebook_url: settings.facebook_url || 'https://facebook.com',
        twitter_url: settings.twitter_url || 'https://twitter.com'
      });
    } catch (err) {
      console.error('Error loading social links:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch Instagram posts first
      const instagramResponse = await socialMediaAPI.getInstagramPosts();

      if (instagramResponse.data.enabled && instagramResponse.data.posts.length > 0) {
        setPosts(instagramResponse.data.posts.map(post => ({
          id: post.id,
          image: post.image_url,
          caption: post.caption,
          platform: 'instagram',
          permalink: post.permalink
        })));
      } else {
        // If Instagram not configured, try Facebook
        const facebookResponse = await socialMediaAPI.getFacebookPosts();

        if (facebookResponse.data.enabled && facebookResponse.data.posts.length > 0) {
          setPosts(facebookResponse.data.posts.map(post => ({
            id: post.id,
            image: post.image_url || '/placeholder-post.png',
            caption: post.message,
            platform: 'facebook',
            permalink: post.permalink
          })));
        } else {
          // Show placeholder posts if no social media configured
          setPosts([
            {
              id: 1,
              image: '/placeholder-quiz.png',
              caption: 'Another fantastic quiz night! 🎯',
              platform: 'placeholder'
            },
            {
              id: 2,
              image: '/placeholder-winners.png',
              caption: 'Congratulations to our winners! 🏆',
              platform: 'placeholder'
            },
            {
              id: 3,
              image: '/placeholder-event.png',
              caption: 'Join us for the next event! 📅',
              platform: 'placeholder'
            }
          ]);
          setError('Social media not configured. Please configure in admin settings.');
        }
      }
    } catch (err) {
      console.error('Error loading social media posts:', err);
      setError('Unable to load social media posts');
      // Show placeholder on error
      setPosts([
        {
          id: 1,
          image: '/placeholder-quiz.png',
          caption: 'Another fantastic quiz night! 🎯',
          platform: 'placeholder'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading social media feed...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Follow Us</h2>
          <p className="text-gray-600 mb-6">Stay updated with our latest quiz nights and events!</p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.instagram_url && (
              <a
                href={socialLinks.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full hover:scale-110 transition-transform"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={24} />
              </a>
            )}
            {socialLinks.facebook_url && (
              <a
                href={socialLinks.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white p-4 rounded-full hover:scale-110 transition-transform"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={24} />
              </a>
            )}
            {socialLinks.twitter_url && (
              <a
                href={socialLinks.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 text-white p-4 rounded-full hover:scale-110 transition-transform"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={24} />
              </a>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Social Media Feed Grid */}
        {posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  {post.permalink ? (
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                      <img
                        src={post.image}
                        alt={post.caption || 'Social media post'}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/placeholder-post.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white text-center p-4">
                          <p className="line-clamp-3">{post.caption || 'View on ' + post.platform}</p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <>
                      <img
                        src={post.image}
                        alt={post.caption || 'Social media post'}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white text-center p-4">
                          <p className="line-clamp-3">{post.caption}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {posts[0]?.platform === 'instagram' && socialLinks.instagram_url && (
              <div className="text-center mt-8">
                <a
                  href={socialLinks.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <Instagram size={20} />
                  View More on Instagram
                </a>
              </div>
            )}

            {posts[0]?.platform === 'facebook' && socialLinks.facebook_url && (
              <div className="text-center mt-8">
                <a
                  href={socialLinks.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <Facebook size={20} />
                  View More on Facebook
                </a>
              </div>
            )}
          </>
        )}

        {/* Admin Setup Instructions */}
        {posts[0]?.platform === 'placeholder' && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">📝 Admin: Configure Social Media</h3>
            <p className="text-gray-700 mb-4">
              To display real posts from Instagram or Facebook, configure your API credentials in the admin settings:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to Admin → Settings</li>
              <li>Scroll to "Social Media Integration"</li>
              <li>Add your Instagram Access Token and User ID (or Facebook credentials)</li>
              <li>Enable the feed and save</li>
            </ol>
            <p className="text-sm text-gray-500 mt-4">
              Need help? Check the documentation for step-by-step setup instructions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialMediaFeed;
