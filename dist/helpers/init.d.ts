import { SWManager } from "../managers";
export declare const isSWRegistrationValid: (allowedBrowsers?: RegExp, forbiddenDomains?: string[], isDebugMode?: boolean) => boolean;
export declare const initSw: (enabled: boolean, swPath?: string) => Promise<SWManager | undefined>;
