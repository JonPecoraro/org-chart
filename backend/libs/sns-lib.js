import AWS from "aws-sdk";

const client = new AWS.SNS();

export default {
  publish: (params) => client.publish(params).promise(),
};
