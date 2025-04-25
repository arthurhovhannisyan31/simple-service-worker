export const DEFAULT_CACHE_NAME = "default-cache-name";
export const DEFAULT_ASSETS_PATH = ""; // No leading slash /
export const SW_VERSION = "v1.0.0";
export const DEFAULT_SW_PATH = "/service-worker.js";

export enum SWActions {
  SHOW_NOTIFICATION = "SHOW_NOTIFICATION",
  LOGOUT = "LOGOUT",
  DISPOSE = "DISPOSE",
  CONNECT_CLIENT = "CONNECT_CLIENT",
  ERROR = "ERROR",
  REGISTRATION = "REGISTRATION",
  REGISTRATION_END = "REGISTRATION_END",
  REGISTRATION_FAILURE = "REGISTRATION_FAILURE",
  UNREGISTER_SW = "UNREGISTER_SW",
  UPDATE_FOUND = "UPDATE_FOUND",
}

// TODO Check usages
export const SWActionLabels: Partial<Record<SWActions, string>> = {
  [SWActions.REGISTRATION]: "SW registration",
  [SWActions.REGISTRATION_FAILURE]: "SW registration failure",
  [SWActions.ERROR]: "SW error",
};

export const swRegistrationConfig: RegistrationOptions = {
  type: "module",
  updateViaCache: "all",
  scope: "/",
};

export enum HttpStatusCode {
  PartialContent = 206,
  RangeNotSatisfiable = 416,
}
