import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let message = "An error occurred";
    
    // Validate UTF-8 encoding for JSON responses
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await res.json();
        
        // Validate that the response contains valid text
        if (typeof errorData.message === 'string' && isValidUTF8(errorData.message)) {
          message = errorData.message;
        } else {
          message = "Invalid server response format";
        }
      } catch {
        // Fallback to text if JSON parsing fails
        try {
          const errorText = await res.text();
          message = isValidUTF8(errorText) ? errorText : "Invalid response encoding";
        } catch {
          message = "Response parsing failed";
        }
      }
    } else {
      try {
        const errorText = await res.text();
        message = isValidUTF8(errorText) ? errorText : "Invalid response encoding";
      } catch {
        message = "Response parsing failed";
      }
    }
    
    throw new Error(message);
  }
}

// Helper function to validate UTF-8 encoding
function isValidUTF8(str) {
  try {
    // Check if string contains valid UTF-8 characters
    if (typeof str !== 'string') return false;
    
    // Check for common encoding issues - garbled characters
    const hasGarbledChars = /[^\x00-\x7F\u00A0-\uFFFF]/.test(str);
    const hasRandomSymbols = /[%#@+=]{5,}/.test(str);
    
    if (hasGarbledChars || hasRandomSymbols) {
      console.warn('Detected potentially garbled response:', str.substring(0, 100));
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest(method, url, data) {
  // Always use the Replit backend URL
  const baseUrl = 'https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev';
  
  // Construct the full URL
  const fullUrl = `${baseUrl}${url}`;
  
  const options = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    try {
      options.body = JSON.stringify(data);
    } catch (jsonError) {
      throw new Error("Failed to serialize request data");
    }
  }

  try {
    const res = await fetch(fullUrl, options);
    await throwIfResNotOk(res);
    return res;
  } catch (fetchError) {
    throw fetchError;
  }
}

export const getQueryFn = (options) => {
  const { on401 } = options;
  return async ({ queryKey }) => {
    const url = queryKey[0];
    
    // Always use the Replit backend URL
    const baseUrl = 'https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev';
    const fullUrl = `${baseUrl}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        credentials: "include",
        cache: "no-cache",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        if (on401 === "returnNull") {
          return null;
        }
        throw new Error("Unauthorized");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Validate response before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format: Expected JSON');
      }
      
      const data = await response.json();
      
      // Validate UTF-8 encoding for string responses
      if (typeof data === 'string' && !isValidUTF8(data)) {
        throw new Error('Invalid response encoding detected');
      }
      
      return data;
    } catch (error) {
      if (on401 === "returnNull" && error.message === "Unauthorized") {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: (failureCount, error) => {
        if (error.message === "Unauthorized") return false;
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});