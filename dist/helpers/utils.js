// eslint-disable-next-line import/no-unresolved
import { UAParser } from "ua-parser-js";
import { SWActions } from "../constants";
export const isSSR = () => typeof window === "undefined";
export const isDebugMode = () => !isSSR() && localStorage.getItem("sw-debug") === "true";
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
export const isSWRegistrationValid = (allowedBrowsers = new RegExp(".*"), forbiddenDomains = [], debug) => {
    if (isSSR() || !navigator.serviceWorker)
        return false;
    const parser = new UAParser(navigator.userAgent);
    const curBrowser = parser.getBrowser()?.name ?? "None";
    const isBrowserAllowed = allowedBrowsers.test(curBrowser);
    const isReferrerAllowed = !forbiddenDomains.some((domain) => document.referrer.includes(domain) || document.URL.includes(domain));
    const debugMode = !!debug || isDebugMode();
    return debugMode || (!isIframe() && isBrowserAllowed && isReferrerAllowed);
};
export const noop = () => null;
//# sourceMappingURL=utils.js.map