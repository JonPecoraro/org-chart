import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // Get the org chart
  const result = await dynamoDb.get({
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
  });
  if (!result.Item) {
    throw new Error("Item not found.");
  }

  // delete associated share link if one exists
  if (result.Item.shareLinkKey.length > 0) {
    await dynamoDb.delete({
      TableName: process.env.tableName,
      Key: {
        pk: "share-link",
        sk: result.Item.shareLinkKey,
      },
    });
  }

  // delete the org chart
  await dynamoDb.delete({
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
  });

  return { status: true };
});
