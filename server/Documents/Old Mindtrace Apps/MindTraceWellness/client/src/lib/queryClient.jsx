import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const errorData = await res.text();
    let message = "An error occurred";
    try {
      const parsed = JSON.parse(errorData);
      message = parsed.message || message;
    } catch {
      // Use default message if JSON parsing fails
    }
    throw new Error(message);
  }
}

export async function apiRequest(method, url, data) {
  const options = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = (options) => {
  const { on401 } = options;
  return async ({ queryKey }) => {
    const url = queryKey[0];
    try {
      const response = await fetch(url, {
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