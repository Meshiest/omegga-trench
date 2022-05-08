import { Vector } from 'omegga';
import { vecAdd, withinBounds } from './math';

export const getSubCubes = (
  scale: number,
  position: Vector,
  deleted: Vector
): { position: Vector; size: Vector }[] => {
  if (scale < 1) return [];

  const size: Vector = [10 * scale, 10 * scale, 10 * scale];
  const half = scale / 2;

  if (!withinBounds(position, size, deleted)) return [{ position, size }];
  if (scale === 1) return [];

  const shift = scale * 5;

  return [
    ...getSubCubes(half, vecAdd(position, [+shift, +shift, +shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [+shift, +shift, -shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [+shift, -shift, +shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [+shift, -shift, -shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [-shift, +shift, +shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [-shift, +shift, -shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [-shift, -shift, +shift]), deleted),
    ...getSubCubes(half, vecAdd(position, [-shift, -shift, -shift]), deleted),
  ];
};
