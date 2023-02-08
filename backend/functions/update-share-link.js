import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const newLinkKey = data.linkKey;

  // Make sure the link key is not used by a different org chart
  const shareLinkResult = await dynamoDb.get({
    TableName: process.env.tableName,
    Key: {
      pk: "share-link",
      sk: newLinkKey,
    },
  });

  if (
    shareLinkResult.Item != null &&
    shareLinkResult.Item.chartId != event.pathParameters.id
  ) {
    // The link is used by a different org chart. Notify the user
    return {
      status: false,
      errorMessage: `The link key "${newLinkKey}" is already used by another org chart.`,
    };
  }

  // Get the associated org chart
  const orgChartResult = await dynamoDb.get({
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
  });

  const createdAt = shareLinkResult.Item?.createdAt ?? Date.now();
  let oldLinkKey = newLinkKey;
  // If the link key changed, update it
  if (orgChartResult.Item.shareLinkKey != newLinkKey) {
    oldLinkKey = orgChartResult.Item.shareLinkKey;
    await dynamoDb.update({
      TableName: process.env.tableName,
      Key: {
        pk: "org-chart",
        sk: event.pathParameters.id,
      },
      UpdateExpression: "SET shareLinkKey = :shareLinkKey",
      ExpressionAttributeValues: {
        ":shareLinkKey": newLinkKey,
      },
      ReturnValues: "ALL_NEW",
    });
  }

  // If the link key is the same, update the share link entry
  // otherwise, delete the old one and add a new entry
  if (oldLinkKey == newLinkKey) {
    await dynamoDb.update({
      TableName: process.env.tableName,
      Key: {
        pk: "share-link",
        sk: oldLinkKey,
      },
      UpdateExpression:
        "SET isEditable = :isEditable, receiveNotifications = :receiveNotifications, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":isEditable": data.isEditable,
        ":receiveNotifications": data.receiveNotifications,
        ":updatedAt": Date.now(),
      },
      // Return all attributes of the item after an update
      ReturnValues: "ALL_NEW",
    });
  } else {
    // The link key is different. Delete old entry and add another
    await dynamoDb.delete({
      TableName: process.env.tableName,
      Key: {
        pk: "share-link",
        sk: oldLinkKey,
      },
    });
    await dynamoDb.put({
      TableName: process.env.tableName,
      Item: {
        pk: "share-link",
        sk: newLinkKey,
        chartId: event.pathParameters.id,
        isEditable: data.isEditable,
        receiveNotifications: data.receiveNotifications,
        createdAt: createdAt,
        updatedAt: Date.now(),
      },
    });
  }

  return { status: true };
});
