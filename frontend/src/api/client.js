import axios from 'axios';
import { supabase } from '../lib/supabase';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Potentially trigger a logout or redirect
      console.error('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default client;
