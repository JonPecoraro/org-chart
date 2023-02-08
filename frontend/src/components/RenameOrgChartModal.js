import { Modal, Button, Form, CloseButton } from "react-bootstrap";
import { useFormFields } from "../lib/formsLib";

export default function RenameOrgChartModal({
  chartDetails,
  onSaveCallback,
  onCLoseCallback,
}) {
  const [fields, handleFieldChange] = useFormFields({
    chartName: chartDetails.name ?? "",
  });
  const handleClose = () => onCLoseCallback();
  const handleSave = () => onSaveCallback(fields);

  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Rename Org Chart</Modal.Title>
        <CloseButton onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="chartName">
            <Form.Label>New Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Org Chart Name"
              onChange={handleFieldChange}
              value={fields.chartName}
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
          disabled={!fields.chartName.length}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
