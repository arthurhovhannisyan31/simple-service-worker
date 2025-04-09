// eslint-disable-next-line import/named
import { UAParser } from "ua-parser-js";

import {
  ALLOWED_BROWSERS,
  FORBIDDEN_DOMAINS,
  NEXT_BASE_PATH,
  SW_ACTIVE,
  SWActions,
} from "lib/workers/service-worker/constants";
import { inIframe, isSSR } from "utility/utils";

import type { AssetsConfig, AssetsManifest } from "lib/workers/service-worker/types";

export const getAssetsConfig = (assetsManifest: AssetsManifest): AssetsConfig => {
  const resources = Object.values(assetsManifest);

  return resources.reduce((acc, { size, path, prefetch }) => {
    acc.paths.push(path);

    if (prefetch) {
      acc.prefetchPaths.push(`/${NEXT_BASE_PATH}/${path}`);
      acc.prefetchSize += size;
    }

    return acc;
  }, {
    paths: [] as string[],
    prefetchPaths: [] as string[],
    prefetchSize: [] as string[],
  });
};

export function isShowNotificationAction(
  action: Action,
): action is Action<NotificationOptions> {
  return action.type === SWActions.SHOW_NOTIFICATION;
}

const getIsDebugMode = (): boolean => localStorage.getItem("sw-debug") === "true";

export const isSWRegistrationValid = (): boolean => {
  if (isSSR() || !navigator.serviceWorker) return false;

  const parser = new UAParser(navigator.userAgent);
  const curBrowser = parser.getBrowser()?.name ?? "None";
  const isBrowserAllowed = ALLOWED_BROWSERS.includes(curBrowser);
  const isReferrerAllowed = !FORBIDDEN_DOMAINS.some((
    domain,
  ) => document.referrer.includes(domain) || document.URL.includes(domain));

  return getIsDebugMode() || (!inIframe() && isBrowserAllowed && isReferrerAllowed);
};

export const isSwEnabled = (): boolean => getIsDebugMode() || SW_ACTIVE;
