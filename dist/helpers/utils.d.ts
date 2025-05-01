export declare const isSSR: () => boolean;
export declare const isDebugMode: () => boolean;
export declare const isIframe: () => boolean;
export declare function isShowNotificationAction(action: Action): action is Action<NotificationOptions>;
export declare const isSWRegistrationValid: (allowedBrowsers?: RegExp, forbiddenDomains?: string[], debug?: boolean) => boolean;
export declare const noop: () => null;
