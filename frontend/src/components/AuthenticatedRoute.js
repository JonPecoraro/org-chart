import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";

export default function AuthenticatedRoute({ children }) {
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <Redirect to={`/login?redirect=${pathname}${search}`} />;
  }

  return children;
}
