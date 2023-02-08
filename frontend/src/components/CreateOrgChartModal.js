import { Modal, Button, Form, CloseButton } from "react-bootstrap";
import { useFormFields } from "../lib/formsLib";

export default function CreateOrgChartModal({
  onSaveCallback,
  onCLoseCallback,
}) {
  const [fields, handleFieldChange] = useFormFields({
    chartName: "",
    employeeName: "",
    employeeTitle: "",
  });
  const handleClose = () => onCLoseCallback();
  const handleSave = () => onSaveCallback(fields);

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Org Chart Details</Modal.Title>
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
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="employeeName">
            <Form.Label>Position</Form.Label>
            <Form.Control
              type="text"
              placeholder="Position"
              onChange={handleFieldChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="employeeTitle">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name"
              onChange={handleFieldChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="mr-auto" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
