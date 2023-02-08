import React from "react";
import { Modal, Button, Form, CloseButton } from "react-bootstrap";
import { useFormFields } from "../lib/formsLib";

export default function ShareOrgChartModal({
  chartDetails,
  onSaveCallback,
  onCLoseCallback,
}) {
  const [fields, handleFieldChange] = useFormFields({
    linkKey: chartDetails.shareLink?.sk ?? "",
    isEditable: chartDetails.shareLink?.isEditable ?? false,
    receiveNotifications: chartDetails.shareLink?.receiveNotifications ?? true,
  });
  const handleClose = () => onCLoseCallback();
  const handleSave = () => onSaveCallback(fields);

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Share Org Chart</Modal.Title>
        <CloseButton onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="linkKey">
            <Form.Label>Link Key</Form.Label>
            <Form.Control
              type="text"
              placeholder="Link Key"
              onChange={handleFieldChange}
              value={fields.linkKey}
              autoFocus
            />
          </Form.Group>
          <div>Share link</div>
          <p>
            {window.location.origin}/org-chart/shared/{fields.linkKey}
          </p>
          <Form.Switch
            id="isEditable"
            label="Allow Editing"
            checked={fields.isEditable}
            onChange={handleFieldChange}
          />
          {fields.isEditable && (
            <>
              <Form.Switch
                id="receiveNotifications"
                label="Receive Change Notifications"
                checked={fields.receiveNotifications}
                onChange={handleFieldChange}
              />
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="mr-auto" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!fields.linkKey.length}
        >
          Save Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
