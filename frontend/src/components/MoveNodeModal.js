import React, { useEffect, useState } from "react";
import { Modal, Alert, Button, Form, CloseButton } from "react-bootstrap";
import { useFormFields } from "../lib/formsLib";
import chartLib from "../lib/chartLib";

export default function ShareOrgChartModal({
  selectedNode,
  onSaveCallback,
  onCLoseCallback,
}) {
  const [currentPosition, setCurrentPosition] = useState("");
  const [maxPosition, setMaxPosition] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [fields, handleFieldChange] = useFormFields({
    newPosition: 1,
  });
  const handleClose = () => onCLoseCallback();
  const handleSave = () => onSaveCallback();

  useEffect(() => {
    let retries = 0;
    async function onLoad() {
      try {
        const parent = await chartLib.getParentNode(selectedNode.id);
        const nodePosition = parent.children.findIndex(
          (n) => n.id == selectedNode.id
        );

        fields.newPosition = nodePosition + 1; // Make position 1 based instead of 0 based
        setCurrentPosition(nodePosition + 1); // Make position 1 based instead of 0 based
        setMaxPosition(parent.children.length);
      } catch (err) {
        retries++;
        if (retries >= 5) {
          setErrorMessage("The top level item can not be moved.");
        } else {
          setTimeout(onLoad, 10);
        }
      }
    }

    onLoad();
    // eslint-disable-next-line
  }, []);

  async function handleMove() {
    try {
      await chartLib.repositionNode(selectedNode.id, fields.newPosition);
      handleSave();
    } catch (err) {
      setErrorMessage("There was an unexpected error moving the item.");
    }
  }

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Reposition Item</Modal.Title>
        <CloseButton onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        {errorMessage.length > 0 && (
          <Alert
            variant="danger"
            className="mt-4"
            onClose={() => setErrorMessage("")}
            dismissible
          >
            {errorMessage}
          </Alert>
        )}
        <p>Current item position: {currentPosition}</p>
        <p>Maximum item position: {maxPosition}</p>
        <Form>
          <Form.Group className="mb-3" controlId="newPosition">
            <Form.Label>New Position</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={maxPosition}
              onChange={handleFieldChange}
              value={fields.newPosition}
              autoFocus
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="mr-auto" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleMove}
          disabled={fields.newPosition < 1 || fields.newPosition > maxPosition}
        >
          Move Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
