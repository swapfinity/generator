import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { GenerationNotifications } from "../general/notifications";

export type NotificationLevel = 'INFO' | 'WARN' | 'ERROR';

export type GenerationResult = {
    geometry: Geom3[];
    notifications?: GenerationNotifications;
    timeSpent?: number;
};