// eslint-disable-next-line import/no-unresolved
import { UAParser } from "ua-parser-js";
import { DEFAULT_SW_PATH, swRegistrationConfig } from "../constants";
import { isSSR, isIframe } from "./utils";
import { SWManager } from "../managers";
// TODO maybe move as static methods to manager
export const isSWRegistrationValid = (allowedBrowsers = new RegExp(".*"), forbiddenDomains = [], isDebugMode) => {
    if (isSSR() || !navigator.serviceWorker)
        return false;
    const parser = new UAParser(navigator.userAgent);
    const curBrowser = parser.getBrowser()?.name ?? "None";
    const isBrowserAllowed = allowedBrowsers.test(curBrowser);
    const isReferrerAllowed = !forbiddenDomains.some((domain) => document.referrer.includes(domain) || document.URL.includes(domain));
    return !!isDebugMode || (!isIframe() && isBrowserAllowed && isReferrerAllowed);
};
// TODO maybe move as static methods to manager
export const initSw = async (enabled, swPath = DEFAULT_SW_PATH) => {
    if (!enabled) {
        try {
            await SWManager.unregister(swPath);
        }
        catch (err) {
            // TODO post message with error
            // TODO track callback
            // trackEvents({
            //   eventName: SWActionLabels[SWActions.ERROR],
            //   eventProperties: {
            //     err: (err as Error)?.message ?? "n/a",
            //     userAgent: navigator?.userAgent ?? "n/a",
            //   },
            // });
        }
        return;
    }
    let serviceWorker;
    try {
        // TODO add post message callback
        serviceWorker = await SWManager.register(swPath, swRegistrationConfig);
        return serviceWorker;
    }
    catch {
        // TODO post message with error
        // trackEvents({
        //   eventName: SWActionLabels[SWActions.REGISTRATION_FAILURE],
        //   eventProperties: {
        //     err: (err as Error)?.message ?? "n/a",
        //     userAgent: navigator?.userAgent ?? "n/a",
        //   },
        // });
    }
};
//# sourceMappingURL=init.js.map