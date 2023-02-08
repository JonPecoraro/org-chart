import React, { useState } from "react";
import { Modal, Button, Form, CloseButton } from "react-bootstrap";
import { useFormFields } from "../lib/formsLib";

export default function ShareOrgChartModal({
  onSaveCallback,
  onCLoseCallback,
}) {
  const [fields, handleFieldChange] = useFormFields({
    chartName: "",
  });
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const handleClose = () => onCLoseCallback();
  const handleSave = () => onSaveCallback(fields.chartName, fileText);

  async function processFile(e) {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setFileText(text);
    };
    reader.readAsText(e.target.files[0]);
    setFileName(e.target.value);
  }

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Import Org Chart</Modal.Title>
        <CloseButton onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="chartName">
            <Form.Label>Org Chart Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Org Chart Name"
              onChange={handleFieldChange}
              value={fields.chartName}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formFile">
            <Form.Label>Org Chart File</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => processFile(e)}
              value={fileName}
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
          onClick={handleSave}
          disabled={!(fields.chartName.length && fileText.length)}
        >
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
