export enum Permissions {
  // Users
  GET_ALL_USERS = "GET_ALL_USERS",
  GET_LOGGED_IN_USER = "GET_LOGGED_IN_USER",
  UPDATE_CURRENT_USER = "UPDATE_CURRENT_USER",
  DELETE_CURRENT_USER = "DELETE_CURRENT_USER",

  // Roles
  CREATE_ROLE = "CREATE_ROLE",
  UPDATE_ROLE = "UPDATE_ROLE",
  DELETE_ROLE = "DELETE_ROLE",
  GET_ROLES = "GET_ROLES",

  // Permissions
  CREATE_PERMISSION = "CREATE_PERMISSION",
  UPDATE_PERMISSION = "UPDATE_PERMISSION",
  DELETE_PERMISSION = "DELETE_PERMISSION",
  GET_PERMISSIONS = "GET_PERMISSIONS",
  GET_PERMISSION = "GET_PERMISSION",

  // COINS
  ADD_COINS = "ADD_COINS",
  GET_ALL_COINS = "GET_ALL_COINS",
  ADD_MARKET_DATA = "ADD_MARKET_DATA",
  GET_MARKET_DATA = "GET_MARKET_DATA",
  GET_MARKET_DATA_BY_COIN = "GET_MARKET_DATA_BY_COIN",
}
