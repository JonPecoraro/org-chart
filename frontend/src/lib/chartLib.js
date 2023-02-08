import JSONDigger from "json-digger";
import { v4 as uuidv4 } from "uuid";

let orgChart = {};
let dsDigger = null;

export default {
  init: (chart) => {
    orgChart = chart;
    dsDigger = new JSONDigger(orgChart, "id", "children");
  },
  getOrgChart: () => orgChart,
  addNode: async (addToNodeId) => {
    const newNode = {
      id: "n" + uuidv4(),
      name: "",
      title: "",
    };
    await dsDigger.addChildren(addToNodeId, [newNode]);
    orgChart = { ...dsDigger.ds };
    return newNode;
  },
  updateNode: async (nodeData) => {
    await dsDigger.updateNode(nodeData);
    orgChart = { ...dsDigger.ds };
  },
  removeNode: async (nodeId) => {
    await dsDigger.removeNodes(nodeId);
    orgChart = { ...dsDigger.ds };
  },
  getParentNode: async (nodeId) => {
    return await dsDigger.findParent(nodeId);
  },
  repositionNode: async (nodeId, newPosition) => {
    try {
      await _repositionNode(nodeId, newPosition);
      orgChart = { ...dsDigger.ds };
    } catch (err) {
      throw err;
    }
  },
};

async function _repositionNode(nodeId, newPosition) {
  let parent = null;
  let retries = 0;
  try {
    parent = await dsDigger.findParent(nodeId);
  } catch (err) {
    retries++;
    if (retries >= 5) {
      throw err;
    } else {
      setTimeout(_repositionNode, 10);
    }
  }

  const children = parent?.children ?? [];
  let siblings = children.filter((n) => n.id != nodeId) ?? [];
  if (siblings.constructor == Object) {
    siblings = [siblings];
  }
  if (newPosition <= children.length) {
    const node = children.find((n) => n.id == nodeId);
    siblings.splice(newPosition - 1, 0, node); // newPosition is 1 based. We subtract 1 to make it zero based
    parent.children = siblings;
  }
}
