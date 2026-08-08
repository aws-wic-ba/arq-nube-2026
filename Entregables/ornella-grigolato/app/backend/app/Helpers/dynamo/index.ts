import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  maxAttempts: 1,
});

export const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

async function getItem<T>(params: GetCommandInput): Promise<T> {
  try {
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item as T;
  } catch (error) {
    throw await error;
  }
}

async function getQueryOne<T>(params: QueryCommandInput): Promise<T> {
  try {
    const data = await documentClient.send(
      new QueryCommand({ ...params, Limit: 1 }),
    );
    return data.Items?.[0] as T;
  } catch (error) {
    throw await error;
  }
}

async function putItem(params: PutCommandInput): Promise<PutCommandOutput> {
  try {
    return await documentClient.send(new PutCommand(params));
  } catch (error) {
    throw await error;
  }
}

export default {
  getItem,
  getQueryOne,
  putItem,
};
