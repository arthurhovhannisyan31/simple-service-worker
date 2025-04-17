// eslint-disable-next-line import/no-unresolved
import { UAParser } from "ua-parser-js";

import {
  ALLOWED_BROWSERS, DEBUG_MODE,
  FORBIDDEN_DOMAINS,
  SW_ENABLED,
  SW_PATH,
  swRegistrationConfig
} from "lib/constants";
import { isSSR, isIframe } from "lib/helpers/utils";
import { SWManager } from "lib/managers";

export const isSWRegistrationValid = (): boolean => {
  if (isSSR() || !navigator.serviceWorker) return false;

  const parser = new UAParser(navigator.userAgent);
  const curBrowser = parser.getBrowser()?.name ?? "None";
  const isBrowserAllowed = ALLOWED_BROWSERS.test(curBrowser);
  const isReferrerAllowed = !FORBIDDEN_DOMAINS.some(
    (domain) => document.referrer.includes(domain) || document.URL.includes(domain)
  );

  return DEBUG_MODE || (!isIframe() && isBrowserAllowed && isReferrerAllowed);
};

export const initSw = async (): Promise<SWManager | undefined> => {
  const isSwEnabled = DEBUG_MODE || SW_ENABLED;

  if (!isSwEnabled) {
    try {
      await SWManager.unregister(SW_PATH);
    } catch (err: unknown) {
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

  let serviceWorker: SWManager;

  try {
    serviceWorker = await SWManager.register(SW_PATH, swRegistrationConfig);

    return serviceWorker;
  } catch {
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
