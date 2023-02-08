import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { format } from "date-fns";
import OrganizationChart from "@dabeng/react-orgchart";
import chartLib from "../lib/chartLib";
import { useFormFields } from "../lib/formsLib";
import "./OrgChart.css";
import MoveNodeModal from "../components/MoveNodeModal";
import LoaderSpinner from "../components/LoaderSpinner";
import {
  Alert,
  Button,
  Dropdown,
  DropdownButton,
  Form,
  Table,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function OrgChartEdit() {
  const orgChartRef = useRef();
  const { chartId, linkKey } = useParams();
  const [chartDetails, setChartDetails] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [moveIconTop, setMoveIconTop] = useState(0);
  const [moveIconLeft, setMoveIconLeft] = useState(0);
  const [isMoveIconShowing, setIsMoveIconShowing] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fields, handleFieldChange] = useFormFields({
    id: "",
    name: "",
    title: "",
  });

  useEffect(() => {
    async function onLoad() {
      let orgChart = {};
      let details = {};
      if (chartId) {
        // Load org chart for authenticated user based on chart ID
        details = await loadOrgChart(chartId);
        orgChart = details.chartJson;
        setIsEditable(true);
        addDeletePressedKeyboardEventListener();
      } else if (linkKey) {
        // Load shared org chart based on share key...user doesn't need to be logged in
        details = await loadSharedOrgChart(linkKey);
        orgChart = details.chartJson;
        setIsEditable(details.shareLink.isEditable);
        setIsSharedLink(true);
        if (details.shareLink.isEditable) {
          addDeletePressedKeyboardEventListener();
        }
      } else {
        // Incorrect parameters supplied
        setErrorMessage(
          "Org chart could not be loaded. The ID or link key was not provided."
        );
        return;
      }
      chartLib.init(orgChart);
      setChartDetails(details);
      setDataSource(chartLib.getOrgChart());
    }

    onLoad();
    // eslint-disable-next-line
  }, []);

  function loadOrgChart(chartId) {
    return API.get("org-charts", `/org-charts/${chartId}`);
  }

  function loadSharedOrgChart(linkKey) {
    return API.get("org-charts", `/org-charts/shared/${linkKey}`);
  }

  function persistOrgChart() {
    const id = chartId ?? chartDetails.sk;
    // Update org chart
    if (isSharedLink) {
      return API.put("org-charts", `/org-charts/update-by-share-link/${id}`, {
        body: {
          name: chartDetails.name,
          chartJson: chartLib.getOrgChart(),
          shareLinkKey: linkKey,
          updatedBy: "Shared Link",
        },
      });
    } else {
      return API.put("org-charts", `/org-charts/${id}`, {
        body: {
          name: chartDetails.name,
          chartJson: chartLib.getOrgChart(),
          updatedBy: "Admin",
        },
      });
    }
  }

  async function handleAddNodeOnDoubleClick(event) {
    const className = event.target.className;
    const isNodeTarget = className.indexOf("oc-node") >= 0;
    const isNodeChildTarget =
      className.indexOf("oc-heading") >= 0 ||
      className.indexOf("oc-content") >= 0;
    const isValidTarget = (isNodeTarget || isNodeChildTarget) && isEditable;
    if (event.detail === 2 && isValidTarget) {
      const nodeElement = isNodeTarget
        ? event.target
        : event.target.parentElement;
      await chartLib.addNode(nodeElement.id);
      setDataSource(chartLib.getOrgChart());
    }
  }

  async function addDeletePressedKeyboardEventListener() {
    document.addEventListener("keyup", removeSelectedNode);
  }

  function readSelectedNode(nodeData) {
    fields.id = nodeData.id;
    fields.name = nodeData.name;
    fields.title = nodeData.title;
    setSelectedNode(nodeData);
    showMoveIcon(nodeData.id);
  }

  function showMoveIcon(nodeId) {
    const element = document.getElementById(nodeId);
    const rect = element.getBoundingClientRect();
    const scrollPosition = document.documentElement.scrollTop;
    setMoveIconTop(rect.y - 20 + scrollPosition);
    setMoveIconLeft(rect.x + 120);
    setIsMoveIconShowing(true);
  }

  function onSaveMoveModal() {
    setDataSource(chartLib.getOrgChart());
    setIsMoveIconShowing(false);
    setShowMoveModal(false);
  }

  function clearSelectedNode() {
    fields.id = "";
    fields.name = "";
    fields.title = "";
    setSelectedNode(null);
    setIsMoveIconShowing(false);
  }

  async function updateSelectedNode() {
    await chartLib.updateNode(fields);
    setDataSource(chartLib.getOrgChart());
  }

  async function removeSelectedNode(event) {
    if (
      (event.key == "Delete" || event.key == "Backspace") &&
      fields.id?.length > 0
    ) {
      await chartLib.removeNode(fields.id);
      clearSelectedNode();
      setDataSource(chartLib.getOrgChart());
    }
  }

  async function saveOrgChart() {
    setIsSaving(true);
    const result = await persistOrgChart();
    setIsSaving(false);
    if (result.status) {
      setSuccessMessage("Org chart successfully saved!");
    } else {
      setErrorMessage("There was an error saving the org chart.");
    }
  }

  function exportOrgChart(exportType) {
    if (exportType == "pdf" || exportType == "png") {
      const orgChartElement = document.getElementsByClassName("orgchart")[0];
      const headerElement = document.createElement("h3");
      headerElement.innerText = chartDetails.name;
      orgChartElement.prepend(headerElement);
      orgChartRef.current.exportTo(chartDetails.name, exportType);
      headerElement.remove();
    } else {
      // Export to JSON
      const chartJson = JSON.stringify(chartLib.getOrgChart(), null, 2);
      const element = document.createElement("a");
      const file = new Blob([chartJson], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = chartDetails.name + ".txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }
  }

  return (
    <div>
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
      {successMessage.length > 0 && (
        <Alert
          variant="success"
          className="mt-4"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}
      {dataSource ? (
        <>
          <div className="row toolbar mx-0 py-2">
            <div className="col-sm-6">
              <h3>{chartDetails.name}</h3>
              <Table borderless size="sm">
                <tbody>
                  {!isSharedLink && (
                    <tr>
                      <td width={135}>Share Link</td>
                      <td>
                        {chartDetails.shareLink?.sk ? (
                          <a
                            href={
                              window.location.origin +
                              "/org-chart/shared/" +
                              chartDetails.shareLink.sk
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {window.location.origin}/org-chart/shared/
                            {chartDetails.shareLink.sk}
                          </a>
                        ) : (
                          "The org chart has not been shared"
                        )}
                        <br />
                        Editable:{" "}
                        {chartDetails.shareLink?.isEditable ? "Yes" : "No"}
                        <br />
                        Update notifications:{" "}
                        {chartDetails.shareLink?.receiveNotifications
                          ? "On"
                          : "Off"}
                      </td>
                    </tr>
                  )}
                  {chartDetails.updatedAt && (
                    <tr>
                      <td width={135}>Last Updated By</td>
                      <td>
                        {chartDetails.updatedBy} on{" "}
                        {format(new Date(chartDetails.updatedAt), "Pp")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="col-sm-6">
              <Form>
                <Table borderless size="sm">
                  <thead>
                    <tr>
                      <th colSpan="2">Selected Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td width={125}>Position</td>
                      <td>
                        <Form.Group className="mb-3" controlId="name">
                          <Form.Control
                            type="text"
                            onChange={handleFieldChange}
                            value={fields.name}
                            disabled={
                              !fields.id.length || !isEditable || isSaving
                            }
                            autoFocus
                          />
                        </Form.Group>
                      </td>
                    </tr>
                    <tr>
                      <td>Name</td>
                      <td>
                        <Form.Group className="mb-3" controlId="title">
                          <Form.Control
                            type="text"
                            onChange={handleFieldChange}
                            value={fields.title}
                            disabled={
                              !fields.id.length || !isEditable || isSaving
                            }
                          />
                        </Form.Group>
                      </td>
                    </tr>
                  </tbody>
                  {isEditable && (
                    <tfoot>
                      <tr>
                        <td colSpan={2}>
                          <Button
                            variant="primary"
                            className="float-right"
                            onClick={updateSelectedNode}
                            disabled={!fields.id.length || isSaving}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </Form>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-6">
              {isEditable && (
                <Button
                  variant="primary"
                  className="saveButton"
                  onClick={saveOrgChart}
                  disabled={isSaving}
                >
                  {isSaving && <LoaderSpinner />}
                  Save Changes
                </Button>
              )}
            </div>
            <div className="col-6">
              <DropdownButton
                id="dropdown-basic-button"
                title="Export"
                variant="primary"
                className="float-right mr-3"
              >
                <Dropdown.Item onClick={() => exportOrgChart("pdf")}>
                  To PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => exportOrgChart("png")}>
                  To PNG
                </Dropdown.Item>
                <Dropdown.Item onClick={() => exportOrgChart("json")}>
                  To Text
                </Dropdown.Item>
              </DropdownButton>
            </div>
          </div>
          <div>
            {isEditable && isMoveIconShowing && (
              <FontAwesomeIcon
                icon="arrows"
                onClick={() => setShowMoveModal(true)}
                style={{
                  display: "block",
                  position: "absolute",
                  top: moveIconTop,
                  left: moveIconLeft,
                  zIndex: 10,
                  cursor: "pointer",
                }}
              />
            )}
            {showMoveModal && (
              <MoveNodeModal
                selectedNode={selectedNode}
                onSaveCallback={onSaveMoveModal}
                onCLoseCallback={() => setShowMoveModal(false)}
              ></MoveNodeModal>
            )}
          </div>
          <div className="orgchart-parent" onClick={handleAddNodeOnDoubleClick}>
            <OrganizationChart
              ref={orgChartRef}
              datasource={dataSource}
              chartClass="customChart"
              collapsible={false}
              multipleSelect={false}
              draggable={isEditable}
              onClickNode={readSelectedNode}
              onClickChart={clearSelectedNode}
            />
          </div>
        </>
      ) : (
        <div className="text-center">
          <LoaderSpinner />
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}
