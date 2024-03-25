export enum UserErrorMessage {
  USER_VALIDATION_ERROR = "All fields are required.",
  USER_PASSWORD_VALIDATION = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
  USER_EMAIL_VALIDATION = "The email address you have entered is not a valid one.",
  USER_IS_INACTIVE = "Account is not activated, please check your email.",
  USER_INVALID_CREDENTIALS = "Invalid credentials.",
  USER_DEFAULT_ROLE_NOT_FOUND = "Default role not found. Please ensure the roles are correctly initialized.",
  USER_EMAIL_EXISTS = "An account with this email already exists.",
  USERNAME_ALREADY_EXISTS = "An account with this username already exists.",
  USER_NOT_FOUND = "User not found",
}
