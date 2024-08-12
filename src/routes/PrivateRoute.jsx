import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("jwtToken");
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
