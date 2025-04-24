// eslint-disable-next-line import/no-unresolved
import { UAParser } from "ua-parser-js";
import { ALLOWED_BROWSERS, DEBUG_MODE, FORBIDDEN_DOMAINS, SW_ENABLED, SW_PATH, swRegistrationConfig } from "../constants";
import { isSSR, isIframe } from "./utils";
import { SWManager } from "../managers";
export const isSWRegistrationValid = () => {
    if (isSSR() || !navigator.serviceWorker)
        return false;
    const parser = new UAParser(navigator.userAgent);
    const curBrowser = parser.getBrowser()?.name ?? "None";
    const isBrowserAllowed = ALLOWED_BROWSERS.test(curBrowser);
    const isReferrerAllowed = !FORBIDDEN_DOMAINS.some((domain) => document.referrer.includes(domain) || document.URL.includes(domain));
    console.log({
        ALLOWED_BROWSERS,
        curBrowser,
        isBrowserAllowed,
        FORBIDDEN_DOMAINS,
        isReferrerAllowed,
        DEBUG_MODE,
        valid: DEBUG_MODE || (!isIframe() && isBrowserAllowed && isReferrerAllowed)
    });
    return DEBUG_MODE || (!isIframe() && isBrowserAllowed && isReferrerAllowed);
};
export const initSw = async () => {
    console.log({
        SW_ENABLED
    });
    if (!SW_ENABLED) {
        try {
            console.log({
                SW_PATH
            });
            await SWManager.unregister(SW_PATH);
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
        serviceWorker = await SWManager.register(SW_PATH, swRegistrationConfig);
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
// TODO Extract as a helper
// export const useInitSW = (): void => {
//   const swManagerRef = useRef<SWManager | null>(null);
//
//   useEffect(() => {
//     if (!isSWRegistrationValid() || swManagerRef.current) return;
//
//     initSw(swManagerRef);
//   }, []);
// };
//# sourceMappingURL=init.js.map