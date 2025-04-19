export declare const DEFAULT_CACHE_VERSION = "0.0.1";
export declare const DEFAULT_ASSETS_PATH = "";
export declare const SW_VERSION = "v1.0.0";
export declare const DEFAULT_SW_PATH = "/service-worker.js";
export declare enum SWActions {
    SHOW_NOTIFICATION = "SHOW_NOTIFICATION",
    LOGOUT = "LOGOUT",
    DISPOSE = "DISPOSE",
    CONNECT_CLIENT = "CONNECT_CLIENT",
    ERROR = "ERROR",
    REGISTRATION = "REGISTRATION",
    REGISTRATION_END = "REGISTRATION_END",
    REGISTRATION_FAILURE = "REGISTRATION_FAILURE",
    UNREGISTER_SW = "UNREGISTER_SW",
    UPDATE_FOUND = "UPDATE_FOUND"
}
export declare const SWActionLabels: Partial<Record<SWActions, string>>;
export declare const swRegistrationConfig: RegistrationOptions;
export declare enum HttpStatusCode {
    PartialContent = 206,
    RangeNotSatisfiable = 416
}
export declare const ALLOWED_BROWSERS: RegExp;
export declare const ASSETS_PATH: string;
export declare const CACHE_VERSION: string;
export declare const DEBUG_MODE: boolean;
export declare const FORBIDDEN_DOMAINS: string[];
export declare const STATIC_ASSETS_PATH: string;
export declare const SW_PATH: string;
export declare const SW_ENABLED: boolean;
