import { SWActions } from "lib/constants";
export const isDebugMode = () => localStorage.getItem("sw-debug") === "true";
export const isSSR = () => typeof window === "undefined";
export const isIframe = () => {
    try {
        return window.self !== window.top;
    }
    catch {
        return true;
    }
};
export function isShowNotificationAction(action) {
    return action.type === SWActions.SHOW_NOTIFICATION;
}
export const parseJSONArray = (env) => {
    const values = [];
    try {
        const parsedValues = JSON.parse(env ?? "[]");
        if (Array.isArray(parsedValues) && parsedValues.every((val) => typeof val === "string")) {
            values.push(...parsedValues);
        }
    }
    catch (err) {
        console.log(err);
    }
    return values;
};
//# sourceMappingURL=utils.js.map