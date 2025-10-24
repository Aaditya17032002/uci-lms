

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL = "https://localhost:7080/api"

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    console.log("Making API call to:", url, "with config:", config)
    console.log("JavaScript accessible cookies:", document.cookie || "(none - but HttpOnly cookies will still be sent)")
    console.log("Credentials mode:", config.credentials)
    console.log("Location protocol:", window.location.protocol)
    console.log("Location hostname:", window.location.hostname)

    const response = await fetch(url, config)
    
    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // Try to get response body for error details
      let errorBody = null;
      try {
        const responseText = await response.text();
        console.log("Error response body:", responseText);
        if (responseText) {
          try {
            errorBody = JSON.parse(responseText);
            console.log("Parsed error response:", errorBody);
          } catch {
            console.log("Error response (text):", responseText);
          }
        }
      } catch (e) {
        console.log("Could not read error response body:", e);
      }
      
      throw new Error(`API call failed: ${response.status} ${response.statusText}${errorBody ? ` - ${JSON.stringify(errorBody)}` : ''}`)
    }
    
    return response.json()
  },

  get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { method: "GET", ...options })
  },

  post(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  put(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { method: "DELETE", ...options })
  },
}
