import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: event.pathParameters.id,
    },
  };

  const result = await dynamoDb.get(params);
  if (!result.Item) {
    throw new Error("Item not found.");
  }

  // get associated share link
  if (result.Item.shareLinkKey.length > 0) {
    const shareLinkResult = await dynamoDb.get({
      TableName: process.env.tableName,
      Key: {
        pk: "share-link",
        sk: result.Item.shareLinkKey,
      },
    });
    result.Item.shareLink = shareLinkResult.Item;
  }

  return result.Item;
});
