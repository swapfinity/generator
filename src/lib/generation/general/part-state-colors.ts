import type { PartState } from "../types/label-part";

export const PART_STATE_COLORS: Record<PartState, [number, number, number] | null> = {
    OK: null,
    WARN: [0.9, 0.65, 0.1],
    ERROR: [0.9, 0.15, 0.15],
};