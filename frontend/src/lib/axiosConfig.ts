import axios from "axios";
import { supabase } from "./supabaseClient";

// Create an axios instance with base URL
export const api = axios.create({
    baseURL: "http://localhost:8081/api",
});

// Add interceptor to include auth token
api.interceptors.request.use(async (config) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        return config;
    } catch (error) {
        return config;
    }
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Redirect to sign in page on authentication errors
            window.location.href = "/signin";
        }
        return Promise.reject(error);
    }
);
