import { isDebugMode, parseJSONArray } from "./helpers";
export const DEFAULT_CACHE_VERSION = "0.0.1";
export const DEFAULT_ASSETS_PATH = ""; // No leading slash /
export const SW_VERSION = "v1.0.0";
export const DEFAULT_SW_PATH = "/service-worker.js";
/*
* Safari is excluded due to issues with binding onFetch event for SW
* Tested on MacOS BigSur VBox
* */
export var SWActions;
(function (SWActions) {
    SWActions["SHOW_NOTIFICATION"] = "SHOW_NOTIFICATION";
    SWActions["LOGOUT"] = "LOGOUT";
    SWActions["DISPOSE"] = "DISPOSE";
    SWActions["CONNECT_CLIENT"] = "CONNECT_CLIENT";
    SWActions["ERROR"] = "ERROR";
    SWActions["REGISTRATION"] = "REGISTRATION";
    SWActions["REGISTRATION_END"] = "REGISTRATION_END";
    SWActions["REGISTRATION_FAILURE"] = "REGISTRATION_FAILURE";
    SWActions["UNREGISTER_SW"] = "UNREGISTER_SW";
    SWActions["UPDATE_FOUND"] = "UPDATE_FOUND";
})(SWActions || (SWActions = {}));
// TODO Check usages
export const SWActionLabels = {
    [SWActions.REGISTRATION]: "SW registration",
    [SWActions.REGISTRATION_FAILURE]: "SW registration failure",
    [SWActions.ERROR]: "SW error",
};
export const swRegistrationConfig = {
    type: "module",
    updateViaCache: "all",
    scope: "/",
};
export var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["PartialContent"] = 206] = "PartialContent";
    HttpStatusCode[HttpStatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
})(HttpStatusCode || (HttpStatusCode = {}));
export const ALLOWED_BROWSERS = new RegExp(process.env.ALLOWED_BROWSERS ?? ".*"); // optional
export const ASSETS_PATH = process.env.ASSETS_PATH ?? DEFAULT_ASSETS_PATH; // optional
export const STATIC_ASSETS_PATH = process.env.ASSETS_PATH ?? DEFAULT_ASSETS_PATH; // optional
export const CACHE_VERSION = process.env.CACHE_VERSION ?? DEFAULT_CACHE_VERSION; // optional
export const DEBUG_MODE = process.env.DEBUG === "true" || isDebugMode(); // optional
export const FORBIDDEN_DOMAINS = parseJSONArray(process.env.FORBIDDEN_DOMAINS ?? "[]"); // optional
export const SW_PATH = process.env.SW_PATH ?? DEFAULT_SW_PATH; // optional
export const SW_ENABLED = process.env.SW_ENABLED === "true"; // required
//# sourceMappingURL=constants.js.map