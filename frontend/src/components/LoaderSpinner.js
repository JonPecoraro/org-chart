import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./LoaderSpinner.css";

export default function LoaderSpinner() {
  return (
    <span className="loader">
      <FontAwesomeIcon icon="spinner" className="spinning" />
    </span>
  );
}
