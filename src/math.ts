import { Vector } from 'omegga';

export const vecSub = (a: Vector, b: Vector): Vector => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const vecAdd = (a: Vector, b: Vector): Vector => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export const vecEq = (a: Vector, b: Vector) => a.every((x, i) => b[i] === x);

export const withinBounds = (
  center: Vector,
  extent: Vector,
  position: Vector
): boolean =>
  center[0] - extent[0] <= position[0] &&
  center[1] - extent[1] <= position[1] &&
  center[2] - extent[2] <= position[2] &&
  center[0] + extent[0] >= position[0] &&
  center[1] + extent[1] >= position[1] &&
  center[2] + extent[2] >= position[2];

export const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));

export const vecStr = (a: number[]) => `[ ${a.join(', ')} ]`;

export const vecScale = (a: Vector, s: number): Vector => [
  a[0] * s,
  a[1] * s,
  a[2] * s,
];
