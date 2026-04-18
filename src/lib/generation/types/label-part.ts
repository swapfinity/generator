import type { Geom2, Geom3 } from "@jscad/modeling/src/geometries/types";

export type PartState = 'OK' | 'WARN' | 'ERROR';

export type LabelPart2D =
    { geom: Geom2; state: PartState }
