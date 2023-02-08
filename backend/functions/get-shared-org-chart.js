import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const linkParams = {
    TableName: process.env.tableName,
    Key: {
      pk: "share-link",
      sk: event.pathParameters.linkKey,
    },
  };

  const sharedLinkResult = await dynamoDb.get(linkParams);
  if (!sharedLinkResult.Item) {
    throw new Error("Item not found.");
  }

  const orgChartParams = {
    TableName: process.env.tableName,
    Key: {
      pk: "org-chart",
      sk: sharedLinkResult.Item.chartId,
    },
  };

  const result = await dynamoDb.get(orgChartParams);
  if (!result.Item) {
    throw new Error("Item not found.");
  }

  result.Item.shareLink = sharedLinkResult.Item;

  return result.Item;
});
