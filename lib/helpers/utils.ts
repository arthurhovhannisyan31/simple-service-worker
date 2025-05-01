// eslint-disable-next-line import/no-unresolved
import { UAParser } from "ua-parser-js";

import { SWActions } from "../constants";

export const isSSR = (): boolean => typeof window === "undefined";

export const isDebugMode = (): boolean => !isSSR() && localStorage.getItem("sw-debug") === "true";

export const isIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export function isShowNotificationAction(
  action: Action,
): action is Action<NotificationOptions> {
  return action.type === SWActions.SHOW_NOTIFICATION;
}
export const isSWRegistrationValid = (
  allowedBrowsers = new RegExp(".*"),
  forbiddenDomains: string[] = [],
  debug?: boolean
): boolean => {
  if (isSSR() || !navigator.serviceWorker) return false;

  const parser = new UAParser(navigator.userAgent);
  const curBrowser = parser.getBrowser()?.name ?? "None";
  const isBrowserAllowed = allowedBrowsers.test(curBrowser);
  const isReferrerAllowed = !forbiddenDomains.some(
    (domain) => document.referrer.includes(domain) || document.URL.includes(domain)
  );
  const debugMode = !!debug || isDebugMode();

  return debugMode || (!isIframe() && isBrowserAllowed && isReferrerAllowed);
};

export const noop = () => null;
