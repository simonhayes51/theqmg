import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Helper function to get settings
async function getSettings() {
  const result = await pool.query(
    `SELECT setting_key, setting_value FROM site_settings
     WHERE setting_key IN (
       'instagram_access_token', 'instagram_user_id', 'instagram_enabled',
       'facebook_access_token', 'facebook_page_id', 'facebook_enabled',
       'whatsapp_number', 'whatsapp_enabled', 'whatsapp_default_message'
     )`
  );

  const settings = {};
  result.rows.forEach(row => {
    settings[row.setting_key] = row.setting_value;
  });
  return settings;
}

// Helper function to get cached posts
async function getCachedPosts(platform, limit = 6) {
  const result = await pool.query(
    `SELECT post_data FROM social_media_cache
     WHERE platform = $1 AND expires_at > NOW()
     ORDER BY cached_at DESC
     LIMIT $2`,
    [platform, limit]
  );
  return result.rows.map(row => row.post_data);
}

// Helper function to cache posts
async function cachePosts(platform, posts) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  for (const post of posts) {
    await pool.query(
      `INSERT INTO social_media_cache (platform, post_id, post_data, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (post_id)
       DO UPDATE SET post_data = $3, cached_at = NOW(), expires_at = $4`,
      [platform, post.id, JSON.stringify(post), expiresAt]
    );
  }
}

// Get Instagram posts
router.get('/instagram', async (req, res) => {
  try {
    const settings = await getSettings();

    if (settings.instagram_enabled !== 'true') {
      return res.json({ enabled: false, posts: [] });
    }

    // Check cache first
    const cachedPosts = await getCachedPosts('instagram', 6);
    if (cachedPosts.length > 0) {
      return res.json({ enabled: true, posts: cachedPosts, cached: true });
    }

    // If no cache or expired, fetch from Instagram
    const accessToken = settings.instagram_access_token;
    const userId = settings.instagram_user_id;

    if (!accessToken || !userId) {
      return res.json({
        enabled: true,
        posts: [],
        error: 'Instagram credentials not configured'
      });
    }

    // Fetch from Instagram Basic Display API
    const response = await axios.get(
      `https://graph.instagram.com/${userId}/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          access_token: accessToken,
          limit: 6
        }
      }
    );

    const posts = response.data.data.map(post => ({
      id: post.id,
      caption: post.caption || '',
      image_url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      media_type: post.media_type
    }));

    // Cache the posts
    await cachePosts('instagram', posts);

    res.json({ enabled: true, posts, cached: false });
  } catch (error) {
    console.error('Instagram API error:', error.response?.data || error.message);

    // Try to return cached posts even if expired
    const cachedPosts = await pool.query(
      `SELECT post_data FROM social_media_cache
       WHERE platform = 'instagram'
       ORDER BY cached_at DESC
       LIMIT 6`
    );

    res.json({
      enabled: true,
      posts: cachedPosts.rows.map(row => row.post_data),
      error: 'Failed to fetch new posts, showing cached data',
      cached: true
    });
  }
});

// Get Facebook posts
router.get('/facebook', async (req, res) => {
  try {
    const settings = await getSettings();

    if (settings.facebook_enabled !== 'true') {
      return res.json({ enabled: false, posts: [] });
    }

    // Check cache first
    const cachedPosts = await getCachedPosts('facebook', 6);
    if (cachedPosts.length > 0) {
      return res.json({ enabled: true, posts: cachedPosts, cached: true });
    }

    // If no cache or expired, fetch from Facebook
    const accessToken = settings.facebook_access_token;
    const pageId = settings.facebook_page_id;

    if (!accessToken || !pageId) {
      return res.json({
        enabled: true,
        posts: [],
        error: 'Facebook credentials not configured'
      });
    }

    // Fetch from Facebook Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}/posts`,
      {
        params: {
          fields: 'id,message,created_time,full_picture,permalink_url,attachments{media,type}',
          access_token: accessToken,
          limit: 6
        }
      }
    );

    const posts = response.data.data.map(post => ({
      id: post.id,
      message: post.message || '',
      image_url: post.full_picture || post.attachments?.data[0]?.media?.image?.src || null,
      permalink: post.permalink_url,
      timestamp: post.created_time
    }));

    // Cache the posts
    await cachePosts('facebook', posts);

    res.json({ enabled: true, posts, cached: false });
  } catch (error) {
    console.error('Facebook API error:', error.response?.data || error.message);

    // Try to return cached posts even if expired
    const cachedPosts = await pool.query(
      `SELECT post_data FROM social_media_cache
       WHERE platform = 'facebook'
       ORDER BY cached_at DESC
       LIMIT 6`
    );

    res.json({
      enabled: true,
      posts: cachedPosts.rows.map(row => row.post_data),
      error: 'Failed to fetch new posts, showing cached data',
      cached: true
    });
  }
});

// Get WhatsApp settings (public)
router.get('/whatsapp', async (req, res) => {
  try {
    const settings = await getSettings();

    res.json({
      enabled: settings.whatsapp_enabled === 'true',
      number: settings.whatsapp_number || '',
      defaultMessage: settings.whatsapp_default_message || 'Hi! I\'d like to know more about your quiz nights.'
    });
  } catch (error) {
    console.error('Get WhatsApp settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh social media cache (admin only)
router.post('/refresh/:platform', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { platform } = req.params;

    // Delete expired cache for this platform
    await pool.query(
      'DELETE FROM social_media_cache WHERE platform = $1',
      [platform]
    );

    res.json({ message: `${platform} cache cleared. Next request will fetch fresh data.` });
  } catch (error) {
    console.error('Refresh cache error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear old cache entries (run periodically)
router.post('/cleanup', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM social_media_cache WHERE expires_at < NOW() RETURNING *'
    );

    res.json({
      message: 'Cache cleanup completed',
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
