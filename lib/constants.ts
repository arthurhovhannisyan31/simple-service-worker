export const SW_VERSION = "v0.5";
export const NEXT_CACHE_VERSION = "NEXT_CACHE_v1.0";
export const SW_ACTIVE = process.env.NEXT_PUBLIC_SW_ACTIVE === "true";
export const SW_PATH = "/service-worker.js";
export const NEXT_BASE_PATH = "_next";
export const NEXT_STATIC_FILE_PATH = `${NEXT_BASE_PATH}/static/`;
export const SW_BROADCAST_CHANNEL = "SW_BROADCAST_CHANNEL";
/*
* Safari is excluded due to issues with binding onFetch event for SW
* Tested on MacOS BigSur VBox
*  */
export const ALLOWED_BROWSERS: string[] = ["Chrome", "Edge", "Chromium", "Firefox", "Opera"];

export const FORBIDDEN_DOMAINS: string[] = ["vercel", "intercom"];

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
