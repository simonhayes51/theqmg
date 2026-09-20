const configuredApiUrl = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

export const API_BASE_URL = configuredApiUrl.replace(/\/api\/?$/, '');
