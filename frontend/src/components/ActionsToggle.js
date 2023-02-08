import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ActionsToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href="#nowhere"
    className="p-2"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    <FontAwesomeIcon icon="ellipsis-v" />
    {children}
  </a>
));
