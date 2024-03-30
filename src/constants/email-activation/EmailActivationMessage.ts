export enum EmailActivationMessage {
  ACTIVATION_TOKEN_NOT_FOUND = "Invalid or expired activation token.",
  ACTIVATION_TOKEN_NOT_EXPIRED = "Activation token has not expired yet.",
  ACTIVATION_TOKEN_REQUIRED = "Activation token is required.",
  ACCOUNT_ACTIVATED = "Your account has been successfully validated and it's active.",
  NEW_ACTIVATION_TOKEN_ISSUED = "You have been issued a new activation token, check your email!",
  ACCOUNT_ALREADY_ACTIVE = "Your account is already active.",
}
