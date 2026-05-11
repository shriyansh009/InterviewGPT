/**
 * Custom React Hook for API calls
 * Handles loading, error, and data states
 */

import { useState, useCallback } from "react";
import apiClient from "./client";

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

export default apiClient;
