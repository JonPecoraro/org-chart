import React from "react";
import { Modal, Button, CloseButton } from "react-bootstrap";

export default function DeleteOrgChartModal({
  chartDetails,
  onConfirmCallback,
  onCLoseCallback,
}) {
  const handleClose = () => onCLoseCallback();
  const handleConfirm = () => onConfirmCallback();

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Delete Org Chart</Modal.Title>
        <CloseButton onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the {chartDetails.name} org chart?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="mr-auto" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm Deletion
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
