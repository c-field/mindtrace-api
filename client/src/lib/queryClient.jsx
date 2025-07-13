import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let message = "An error occurred";
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch {
        // Fallback to text if JSON parsing fails
        try {
          const errorText = await res.text();
          message = errorText || message;
        } catch {
          // Use default message if all parsing fails
        }
      }
    } else {
      try {
        const errorText = await res.text();
        message = errorText || message;
      } catch {
        // Use default message if text parsing fails
      }
    }
    
    throw new Error(message);
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
      
      return response.json();
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