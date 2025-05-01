export const DEFAULT_CACHE_NAME = "default-cache-name";
export const DEFAULT_ASSETS_PATH = ""; // No leading slash /
export const SW_VERSION = "v1.0.0";
export const DEFAULT_SW_PATH = "/service-worker.js";
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
//# sourceMappingURL=constants.js.map