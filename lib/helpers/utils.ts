import { SWActions } from "lib/constants";

export const isDebugMode = (): boolean => localStorage.getItem("sw-debug") === "true";

export const isSSR = (): boolean => typeof window === "undefined";

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

export const parseJSONArray = <T>(
  env?: string
): T[] => {
  const values: T[] = [];

  try {
    const parsedValues = JSON.parse(env ?? "[]") as T[];

    if (Array.isArray(parsedValues) && parsedValues.every((val) => typeof val === "string")) {
      values.push(...parsedValues);
    }
  } catch (err) {
    console.log(err);
  }

  return values;
};
