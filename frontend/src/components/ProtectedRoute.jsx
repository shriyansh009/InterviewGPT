/**
 * Protected Route Component
 * Redirects to sign-in if user is not authenticated
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

export default ProtectedRoute;
