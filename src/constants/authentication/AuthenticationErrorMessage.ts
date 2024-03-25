export enum AuthenticationErrorMessage {
  ACCESS_TOKEN_REQUIRED = "Access Token is required.",
  ACCESS_TOKEN_INVALID = "Invalid or Expired Access Token.",
  ACCESS_TOKEN_EXPIRED = "Expired access token.",
  NO_ACCESS_TOKEN = "No token provided.",
  REFRESH_TOKEN_REQUIRED = "Refresh Token is required.",
  REFRESH_TOKEN_INVALID = "Invalid Refresh Token.",
  CSRF_TOKEN_NOT_FOUND = "CSRF Token not found.",
  TOO_MANY_LOGIN_ATTEMPTS = "Too many attempts, please try again later.",
}
