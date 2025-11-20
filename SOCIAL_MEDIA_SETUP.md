# Social Media Integration Setup Guide

This guide will help you set up Instagram, Facebook, and WhatsApp integration for The Quiz Master General website.

## 🎯 Features

- **Instagram Feed**: Display your latest Instagram posts on the homepage
- **Facebook Feed**: Display Facebook page posts on the homepage
- **WhatsApp Chat**: Floating chat widget and contact page integration

## 📱 WhatsApp Setup (Easiest - 5 minutes)

### Step 1: Get Your WhatsApp Business Number
1. Sign up for WhatsApp Business on your phone
2. Note your phone number in international format (e.g., `447xxxxxxxxx` for UK)
   - Remove spaces, dashes, or parentheses
   - Include country code (44 for UK)
   - Example: `447123456789`

### Step 2: Configure in Admin
1. Log into your admin panel
2. Run this SQL to add the settings (or add them directly in admin):
   ```sql
   INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
   ('whatsapp_number', '447123456789', 'text', 'WhatsApp business number'),
   ('whatsapp_enabled', 'true', 'boolean', 'Enable WhatsApp chat widget'),
   ('whatsapp_default_message', 'Hi! I''d like to know more about your quiz nights.', 'text', 'Default WhatsApp message')
   ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
   ```
3. Replace `447123456789` with your actual WhatsApp number
4. The floating chat widget will now appear on all pages!

## 📸 Instagram Integration (Medium - 30-45 minutes)

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" app type
4. Name your app (e.g., "Quiz Master General Website")
5. Complete the setup

### Step 2: Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App" in the Instagram Basic Display section
4. Accept the terms

### Step 3: Configure Instagram App
1. Under "Basic Display", click "Instagram App Settings"
2. Add OAuth Redirect URIs:
   ```
   https://socialsizes.io/api/oauth
   ```
3. Add Deauthorize Callback URL and Data Deletion Request URL:
   ```
   https://yourdomain.com/privacy
   ```
4. Save changes

### Step 4: Generate Access Token
1. Go to "Basic Display" → "User Token Generator"
2. Click "Add Instagram Test User"
3. Follow the Instagram authentication flow
4. Copy the generated Access Token (starts with `IGQV...`)
5. Copy your Instagram User ID (numeric, usually shown next to token)

### Step 5: Get Long-Lived Token
Instagram tokens expire after 1 hour. Convert to long-lived (60 days):

```bash
curl -X GET "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_APP_SECRET&access_token=YOUR_SHORT_LIVED_TOKEN"
```

Replace:
- `YOUR_APP_SECRET`: From Facebook App Dashboard → Settings → Basic
- `YOUR_SHORT_LIVED_TOKEN`: The token from Step 4

The response will give you a long-lived token (60 days).

### Step 6: Configure in Database
```sql
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('instagram_access_token', 'YOUR_LONG_LIVED_TOKEN', 'text', 'Instagram API access token'),
('instagram_user_id', 'YOUR_USER_ID', 'text', 'Instagram user ID'),
('instagram_enabled', 'true', 'boolean', 'Enable Instagram feed')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

### Step 7: Refresh Token Automatically
Tokens expire after 60 days. Set up a cron job to refresh:

```bash
# Add to crontab: Refresh token every 30 days
0 0 1,15 * * curl -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=CURRENT_TOKEN"
```

## 📘 Facebook Integration (Medium - 30-45 minutes)

### Step 1: Create Facebook Page
- If you don't have one, create a Facebook Page for your business
- Note your Page ID (found in Page Settings → About)

### Step 2: Get Facebook App
- Use the same Facebook App from Instagram setup, or create a new one

### Step 3: Generate Page Access Token
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select permissions:
   - `pages_show_list`
   - `pages_read_engagement`
5. Copy the short-lived token

### Step 4: Get Long-Lived Token
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

### Step 5: Get Page Token
```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN"
```

This returns page tokens. Find your page and copy its `access_token`.

### Step 6: Configure in Database
```sql
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('facebook_access_token', 'YOUR_PAGE_ACCESS_TOKEN', 'text', 'Facebook page access token'),
('facebook_page_id', 'YOUR_PAGE_ID', 'text', 'Facebook page ID'),
('facebook_enabled', 'true', 'boolean', 'Enable Facebook feed')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

## 🔄 Cache Management

The app automatically caches social media posts for 1 hour to avoid rate limits.

### Manual Cache Refresh (Admin Only)
```bash
# Clear Instagram cache
curl -X POST http://localhost:5000/api/social-media/refresh/instagram \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clear Facebook cache
curl -X POST http://localhost:5000/api/social-media/refresh/facebook \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clean up expired cache
curl -X POST http://localhost:5000/api/social-media/cleanup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🧪 Testing

1. **WhatsApp**:
   - Visit any page and click the green floating button
   - Visit the contact page and click "Chat on WhatsApp"
   - Should open WhatsApp Web/App with pre-filled message

2. **Instagram/Facebook**:
   - Visit the homepage
   - Scroll to "Follow Us" section
   - Should see your latest posts
   - Click a post to view on Instagram/Facebook

## 🔧 Troubleshooting

### Instagram Posts Not Showing
- Check token is valid (not expired)
- Verify `instagram_enabled` is set to `'true'` (string, not boolean)
- Check console for API errors
- Ensure Instagram account is public or app has proper permissions

### Facebook Posts Not Showing
- Verify page access token has proper permissions
- Check page ID is correct
- Ensure page has published posts

### WhatsApp Not Working
- Verify number format: `447xxxxxxxxx` (no spaces, include country code)
- Check `whatsapp_enabled` is `'true'`
- Test number with: `https://wa.me/447123456789`

### Cached Old Posts
- Clear cache using admin endpoint
- Cache refreshes automatically every hour
- Restart server to force refresh

## 📊 Rate Limits

- **Instagram**: 200 requests per hour per token
- **Facebook**: Varies by app tier (typically 200/hour for standard tier)
- **Cache**: Reduces API calls to 1 per hour per platform

## 🔐 Security Notes

- Never commit access tokens to git
- Store tokens in database only
- Rotate tokens periodically
- Use environment variables for sensitive data in production
- Consider using Facebook Business Integration for better limits

## 📞 Support

Need help? Check:
- [Instagram Basic Display API Docs](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
