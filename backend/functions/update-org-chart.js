import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

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

  await dynamoDb.update(params);

  return { status: true };
});
