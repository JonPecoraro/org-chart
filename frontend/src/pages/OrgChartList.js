import React, { useState, useEffect } from "react";
import { Alert, Button, Dropdown, Table } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionsToggle } from "../components/ActionsToggle";
import LoaderSpinner from "../components/LoaderSpinner";
import CreateOrgChartModal from "../components/CreateOrgChartModal";
import ImportOrgChartModal from "../components/ImportOrgChartModal";
import { onError } from "../lib/errorLib";
import "./OrgChartList.css";
import ShareOrgChartModal from "../components/ShareOrgChartModal";
import RenameOrgChartModal from "../components/RenameOrgChartModal";
import DeleteOrgChartModal from "../components/DeleteOrgChartModal";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

const ActionType = {
  Create: "Create Org Chart",
  Import: "Import Org Chart",
  Edit: "Edit",
  Share: "Share",
  UpdateShare: "Update Share Link",
  Rename: "Rename",
  Delete: "Delete",
};

export default function OrgChartList() {
  const history = useHistory();
  const [orgChartsDetail, setOrgChartsDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentChartDetails, setCurrentChartDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function onLoad() {
      try {
        const chartsDetail = await loadOrgChartsDetail();
        setOrgChartsDetail(chartsDetail);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
    // eslint-disable-next-line
  }, []);

  function loadOrgChartsDetail() {
    return API.get("org-charts", "/org-charts");
  }

  function createOrgChart(fields) {
    return API.post("org-charts", "/org-charts", {
      body: {
        name: fields.chartName,
        chartJson: {
          id: uuidv4(),
          name: fields.employeeName,
          title: fields.employeeTitle,
        },
        updatedBy: "Admin",
      },
    });
  }

  function importOrgChart(chartName, chartJson) {
    return API.post("org-charts", "/org-charts", {
      body: {
        name: chartName,
        chartJson: chartJson,
        updatedBy: "Admin",
      },
    });
  }

  function renameOrgChart(fields) {
    return API.put("org-charts", `/org-charts/${currentChartDetails.sk}`, {
      body: {
        name: fields.chartName,
        chartJson: currentChartDetails.chartJson,
        updatedBy: "Admin",
      },
    });
  }

  function deleteOrgChart() {
    return API.del("org-charts", `/org-charts/${currentChartDetails.sk}`);
  }

  function saveShareLink(fields) {
    const data = {
      linkKey: fields.linkKey,
      isEditable: fields.isEditable,
      receiveNotifications: fields.receiveNotifications,
    };
    return currentChartDetails.shareLink
      ? // update
        API.put("org-charts", `/org-charts/share/${currentChartDetails.sk}`, {
          body: data,
        })
      : // create
        API.post("org-charts", `/org-charts/share/${currentChartDetails.sk}`, {
          body: data,
        });
  }

  function onActionClick(chartDetails, actionType) {
    setCurrentChartDetails(chartDetails);
    switch (actionType) {
      case ActionType.Create:
        setShowCreateModal(true);
        break;
      case ActionType.Import:
        setShowImportModal(true);
        break;
      case ActionType.Edit:
        history.push(`/org-chart/${chartDetails.sk}`);
        break;
      case ActionType.Share:
        setShowShareModal(true);
        break;
      case ActionType.Rename:
        setShowRenameModal(true);
        break;
      case ActionType.Delete:
        setShowDeleteModal(true);
        break;
      default:
        console.log(`Unrecognized action ${actionType}`);
        break;
    }
  }

  async function onSaveCreateModal(fields) {
    setShowCreateModal(false);
    const result = await createOrgChart(fields);
    history.push(`/org-chart/${result.sk}`);
  }

  async function onSaveImportModal(chartName, fileText) {
    setShowImportModal(false);
    try {
      const chartJson = JSON.parse(fileText);
      const result = await importOrgChart(chartName, chartJson);
      history.push(`/org-chart/${result.sk}`);
    } catch (e) {
      setErrorMessage(
        "Invalid file format. Export an org chart for an example of a valid file format."
      );
    }
  }

  async function onSaveShareLink(fields) {
    setShowShareModal(false);
    const result = await saveShareLink(fields);
    if (result.status) {
      const chartsDetail = await loadOrgChartsDetail();
      setOrgChartsDetail(chartsDetail);
    } else {
      setErrorMessage(result.errorMessage);
    }
  }

  async function onSaveRenameModal(fields) {
    setShowRenameModal(false);
    const result = await renameOrgChart(fields);
    if (result.status) {
      const chartsDetail = await loadOrgChartsDetail();
      setOrgChartsDetail(chartsDetail);
    } else {
      setErrorMessage(result.errorMessage);
    }
  }

  async function onConfirmDelete() {
    setShowDeleteModal(false);
    const result = await deleteOrgChart(currentChartDetails.sk);
    if (result.status) {
      const chartsDetail = await loadOrgChartsDetail();
      setOrgChartsDetail(chartsDetail);
      setSuccessMessage(
        `Org chart ${currentChartDetails.name} has been deleted.`
      );
    } else {
      setErrorMessage("There was an issue deleting the org chart.");
    }
  }

  return (
    <div className="OrgChartList">
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
      <div className="row mb-3">
        <div className="col-6">
          <Button
            variant="primary"
            onClick={(e) => onActionClick(null, ActionType.Import)}
          >
            {ActionType.Import}
          </Button>
        </div>
        <div className="col-6">
          <Button
            className="float-right"
            variant="primary"
            onClick={(e) => onActionClick(null, ActionType.Create)}
          >
            {ActionType.Create}
          </Button>
        </div>
      </div>

      <Table striped bordered hover size="sm">
        <thead>
          <tr className="text-center">
            <th>Name</th>
            <th>Shared Links</th>
            <th>Last Update</th>
            <th>Updated By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orgChartsDetail?.length ? (
            orgChartsDetail.map((chartDetails) => (
              <tr key={chartDetails.sk}>
                <td>{chartDetails.name}</td>
                <td>
                  {chartDetails.shareLink ? (
                    <>
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
                      {chartDetails.shareLink.receiveNotifications && (
                        <FontAwesomeIcon
                          icon="envelope"
                          className="text-secondary mr-2 float-right"
                        />
                      )}
                      {chartDetails.shareLink.isEditable && (
                        <FontAwesomeIcon
                          icon="pencil"
                          className="text-secondary mr-2 float-right"
                        />
                      )}
                    </>
                  ) : (
                    <span>The org chart has not been shared</span>
                  )}
                </td>
                <td>{format(new Date(chartDetails.updatedAt), "Pp")}</td>
                <td>{chartDetails.updatedBy}</td>
                <td className="text-center">
                  <Dropdown align="end">
                    <Dropdown.Toggle as={ActionsToggle} />
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={(e) =>
                          onActionClick(chartDetails, ActionType.Edit)
                        }
                      >
                        {ActionType.Edit}
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={(e) =>
                          onActionClick(chartDetails, ActionType.Share)
                        }
                      >
                        {chartDetails.shareLink
                          ? ActionType.UpdateShare
                          : ActionType.Share}
                      </Dropdown.Item>
                      <DropdownItem
                        onClick={(e) =>
                          onActionClick(chartDetails, ActionType.Rename)
                        }
                      >
                        {ActionType.Rename}
                      </DropdownItem>
                      <Dropdown.Item
                        onClick={(e) =>
                          onActionClick(chartDetails, ActionType.Delete)
                        }
                      >
                        {ActionType.Delete}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                {orgChartsDetail ? (
                  "No org charts have been created"
                ) : (
                  <LoaderSpinner />
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {showCreateModal && (
        <CreateOrgChartModal
          onSaveCallback={onSaveCreateModal}
          onCLoseCallback={() => setShowCreateModal(false)}
        ></CreateOrgChartModal>
      )}
      {showImportModal && (
        <ImportOrgChartModal
          onSaveCallback={onSaveImportModal}
          onCLoseCallback={() => setShowImportModal(false)}
        ></ImportOrgChartModal>
      )}
      {showShareModal && (
        <ShareOrgChartModal
          chartDetails={currentChartDetails}
          onSaveCallback={onSaveShareLink}
          onCLoseCallback={() => setShowShareModal(false)}
        ></ShareOrgChartModal>
      )}
      {showRenameModal && (
        <RenameOrgChartModal
          chartDetails={currentChartDetails}
          onSaveCallback={onSaveRenameModal}
          onCLoseCallback={() => setShowRenameModal(false)}
        ></RenameOrgChartModal>
      )}
      {showDeleteModal && (
        <DeleteOrgChartModal
          chartDetails={currentChartDetails}
          onConfirmCallback={onConfirmDelete}
          onCLoseCallback={() => setShowDeleteModal(false)}
        ></DeleteOrgChartModal>
      )}
    </div>
  );
}
