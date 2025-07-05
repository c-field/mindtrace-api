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
  // Debug logging for iOS
  console.log("=== DEBUG: apiRequest ===");
  console.log("Method:", method);
  console.log("URL:", url);
  console.log("Data:", data);
  
  // Always use the production API base URL
  const baseUrl = 'https://mindtrace-api-sigma.vercel.app';
  
  // Construct the full URL
  const fullUrl = `${baseUrl}${url}`;
  
  console.log("🔧 URL construction:");
  console.log("- Base URL:", baseUrl);
  console.log("- Original URL:", url);
  console.log("- Full URL:", fullUrl);
  
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
      console.log("Request body:", options.body);
      console.log("Request body type:", typeof options.body);
    } catch (jsonError) {
      console.error("JSON.stringify error:", jsonError);
      throw new Error("Failed to serialize request data");
    }
  }
  
  console.log("Request options:", options);

  try {
    // Log the actual fetch call details for iOS debugging
    console.log("🌐 Making fetch request:");
    console.log("- Full URL:", fullUrl);
    console.log("- Base URL origin:", window.location.origin);
    console.log("- Is relative URL:", !fullUrl.startsWith('http'));
    
    const res = await fetch(fullUrl, options);
    console.log("📥 Fetch response received:");
    console.log("- Status:", res.status);
    console.log("- Status text:", res.statusText);
    console.log("- Headers:", Object.fromEntries(res.headers.entries()));
    console.log("- URL after redirect:", res.url);
    console.log("- Type:", res.type);
    
    await throwIfResNotOk(res);
    return res;
  } catch (fetchError) {
    console.error("💥 Fetch error details:");
    console.error("- Error name:", fetchError.name);
    console.error("- Error message:", fetchError.message);
    console.error("- Full error:", fetchError);
    throw fetchError;
  }
}

export const getQueryFn = (options) => {
  const { on401 } = options;
  return async ({ queryKey }) => {
    const url = queryKey[0];
    
    // Always use the production API base URL
    const baseUrl = 'https://mindtrace-api-sigma.vercel.app';
    const fullUrl = `${baseUrl}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        credentials: "include",
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