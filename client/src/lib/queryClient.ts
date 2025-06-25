import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add patient session header if available
  const patientSession = localStorage.getItem('patientSession');
  const professionalInfo = localStorage.getItem('professionalInfo');
  
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  if (patientSession) {
    headers['x-patient-session'] = patientSession;
  }
  
  // Add professional code header if available
  if (professionalInfo) {
    try {
      const professional = JSON.parse(professionalInfo);
      if (professional.accessCode) {
        headers['x-professional-code'] = professional.accessCode;
      }
    } catch (error) {
      console.error('Error parsing professional info:', error);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add patient session header if available
    const patientSession = localStorage.getItem('patientSession');
    const professionalInfo = localStorage.getItem('professionalInfo');
    
    const headers: HeadersInit = {};
    
    if (patientSession) {
      headers['x-patient-session'] = patientSession;
    }
    
    // Add professional code header if available
    if (professionalInfo) {
      try {
        const professional = JSON.parse(professionalInfo);
        if (professional.accessCode) {
          headers['x-professional-code'] = professional.accessCode;
        }
      } catch (error) {
        console.error('Error parsing professional info:', error);
      }
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
