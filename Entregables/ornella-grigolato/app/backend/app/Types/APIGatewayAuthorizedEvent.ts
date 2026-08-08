import {
  APIGatewayEventClientCertificate,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";

type APIGatewayAuthorizedEvent = APIGatewayProxyEventV2WithRequestContext<{
  accountId: string;
  apiId: string;
  authentication?: {
    clientCert: APIGatewayEventClientCertificate;
  };
  domainName: string;
  domainPrefix: string;
  http: {
    method: string;
    path: string;
    protocol: string;
    sourceIp: string;
    userAgent: string;
  };
  authorizer: {
    claims: {
      sub: string;
      iss: string;
      client_id: string;
      origin_jti: string;
      event_id: string;
      token_use: string;
      scope: string;
      auth_time: number;
      exp: number;
      iat: number;
      jti: string;
      username: string;
      email: string;
      "custom:association_slug"?: string;
    };
    scopes: string[];
    principalId: string;
  };
  requestId: string;
  routeKey: string;
  stage: string;
  time: string;
  timeEpoch: number;
}>;

export default APIGatewayAuthorizedEvent;
