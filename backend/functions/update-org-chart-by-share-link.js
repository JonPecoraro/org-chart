import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import sns from "../libs/sns-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
    UpdateExpression:
      "SET #chartName = :name, chartJson = :chartJson, updatedBy = :updatedBy, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":name": data.name || null,
      ":chartJson": data.chartJson || null,
      ":updatedBy": data.updatedBy || null,
      ":updatedAt": Date.now(),
    },
    ExpressionAttributeNames: {
      // name is a reserved word, so we alias it with chartName
      "#chartName": "name",
    },
    // Return all attributes of the item after an update
    ReturnValues: "ALL_NEW",
  };

  // Get the share link details
  const shareLinkResult = await dynamoDb.get({
    TableName: process.env.tableName,
    Key: {
      pk: "share-link",
      sk: data.shareLinkKey,
    },
  });
  if (!shareLinkResult.Item) {
    throw new Error("Share link not found.");
  }

  // Make sure org chart can actually be updated by a share link
  if (!shareLinkResult.Item.isEditable) {
    throw new Error(`Org chart ${data.name} is not editable.`);
  }

  // Email admin if they requested change notifications
  if (shareLinkResult.Item.receiveNotifications) {
    await sns.publish({
      Message: `Org chart ${data.name} has been updated through the shared link.`,
      TopicArn: process.env.snsTopicArn,
    });
  }

  await dynamoDb.update(params);

  return { status: true };
});
