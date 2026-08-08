import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
  AdminSetUserPasswordCommandOutput,
  AdminDeleteUserCommand,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

async function adminCreateUser(
  params: AdminCreateUserCommandInput,
): Promise<AdminCreateUserCommandOutput> {
  try {
    return await client.send(new AdminCreateUserCommand(params));
  } catch (error) {
    throw error;
  }
}

async function adminSetUserPassword(
  params: AdminSetUserPasswordCommandInput,
): Promise<AdminSetUserPasswordCommandOutput> {
  try {
    return await client.send(new AdminSetUserPasswordCommand(params));
  } catch (error) {
    throw error;
  }
}

async function adminDeleteUser(
  params: AdminDeleteUserCommandInput,
): Promise<AdminDeleteUserCommandOutput> {
  try {
    return await client.send(new AdminDeleteUserCommand(params));
  } catch (error) {
    throw error;
  }
}

export default {
  adminCreateUser,
  adminSetUserPassword,
  adminDeleteUser,
};
