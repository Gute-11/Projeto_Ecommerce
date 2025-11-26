import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { loading, user, isAdmin } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
