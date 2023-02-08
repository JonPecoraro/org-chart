import * as uuid from "uuid";
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      pk: "org-chart",
      sk: uuid.v1(),
      name: data.name,
      shareLinkKey: "",
      chartJson: data.chartJson,
      updatedBy: data.updatedBy, // Valid values: [Admin, Shared Link]
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});
