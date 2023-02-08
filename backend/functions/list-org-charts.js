import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "pk = :pk",
    ScanIndexForward: true,
    ExpressionAttributeValues: {
      ":pk": "org-chart",
    },
  };

  const result = await dynamoDb.query(params);

  // get associated share links
  for (const orgChart of result.Items) {
    if (orgChart.shareLinkKey.length > 0) {
      const shareLinkResult = await dynamoDb.get({
        TableName: process.env.tableName,
        Key: {
          pk: "share-link",
          sk: orgChart.shareLinkKey,
        },
      });
      orgChart.shareLink = shareLinkResult.Item;
    }
  }

  return result.Items;
});
