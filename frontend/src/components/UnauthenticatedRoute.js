import React, { cloneElement } from "react";
import { Redirect } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";
import querystring from "../lib/querystringLib";

export default function UnauthenticatedRoute(props) {
  const { isAuthenticated } = useAppContext();
  const { children } = props;
  const redirect = querystring("redirect");

  if (isAuthenticated) {
    return <Redirect to={redirect || "/"} />;
  }

  return cloneElement(children, props);
}
