import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const linkKey = data.linkKey;

  // Try to get the link to see if it's already used
  // Each link can only be used once
  const linkResult = await dynamoDb.get({
    TableName: process.env.tableName,
    Key: {
      pk: "share-link",
      sk: linkKey,
    },
  });

  if (linkResult.Item != null) {
    // Link is already used. Notify user
    return {
      status: false,
      errorMessage: `The link key "${linkKey}" is already used by another org chart.`,
    };
  }

  // Link is not used. Associate it to this org chart
  const params = {
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
    UpdateExpression: "SET shareLinkKey = :shareLinkKey",
    ExpressionAttributeValues: {
      ":shareLinkKey": linkKey,
    },
    // Return all attributes of the item after an update
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  // Add entry for new shared link
  const linkParams = {
    TableName: process.env.tableName,
    Item: {
      pk: "share-link",
      sk: linkKey,
      chartId: event.pathParameters.id,
      isEditable: data.isEditable,
      receiveNotifications: data.receiveNotifications,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  await dynamoDb.put(linkParams);

  return { status: true };
});
