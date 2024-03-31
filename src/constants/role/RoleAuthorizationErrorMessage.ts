export enum RoleAuthorizationErrorMessage {
  ACCESS_DENIED = "Access Denied.",
  ONLY_OWN_PROFILE_UPDATE_ALLOWED = "Unauthorized: You can only update your own profile.",
  ONLY_OWN_PROFILE_DELETE_ALLOWED = "Unauthorized: You can only delete your own profile.",
  ONLY_ADMINS_CAN_UPDATE_ROLES = "Unauthorized: Only admins can update user roles.",
  ROLE_NOT_FOUND = "Role not found.",
  ROLE_ALREADY_EXISTS = "Role already exists.",
}
