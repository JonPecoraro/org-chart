import React from "react";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./LoaderButton.css";

export default function LoaderButton({
  isLoading,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={`LoaderButton ${className}`}
      {...props}
    >
      {isLoading && (
        <>
          <FontAwesomeIcon icon="spinner" className="spinning" />
          &nbsp;&nbsp;
        </>
      )}
      {props.children}
    </Button>
  );
}
