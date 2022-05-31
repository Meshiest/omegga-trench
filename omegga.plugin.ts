import OmeggaPlugin, { OL, PC, PS, Vector } from 'omegga';
import { clamp, vecAdd, vecScale, vecSub } from 'src/math';
import { getSubCubes } from 'src/oct';

type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async getPositionWithPawn(pawn: string): Promise<Vector> {
    // given a player's pawn, match the player's position
    const posRegExp = new RegExp(
      `CapsuleComponent .+?PersistentLevel\\.${pawn}\\.CollisionCylinder\\.RelativeLocation = \\(X=(?<x>[\\d\\.-]+),Y=(?<y>[\\d\\.-]+),Z=(?<z>[\\d\\.-]+)\\)`
    );

    // wait for the position promise
    const [
      {
        groups: { x, y, z },
      },
    ] = await Omegga.addWatcher(posRegExp, {
      // request the position for this player's pawn
      exec: () =>
        Omegga.writeln(
          `GetAll SceneComponent RelativeLocation Name=CollisionCylinder Outer=${pawn}`
        ),
      timeoutDelay: 100,
    });

    // return the player's position as an array of numbers
    return [Number(x), Number(y), Number(z)];
  }

  async init() {
    let dirt: Record<string, number> = {};

    // Write your plugin!
    this.omegga.on(
      'interact',
      async ({ player: { id, pawn }, position, brick_name, message }) => {
        if (message !== 'trench') return;
        const match = brick_name.match(/^(2|4|8|16|32|64)x Cube$/);
        if (!match) return;

        const size = Number(match[1]);
        const half = size / 2;
        const region = {
          center: position,
          extent: [size * 5, size * 5, size * 5] as Vector,
        };

        // const player = Omegga.getPlayer(id);

        try {
          const [/* crouched,  */ playerPos, data] = await Promise.all([
            // player.isCrouched(pawn),
            this.getPositionWithPawn(pawn),
            Omegga.getSaveData(region),
          ]);

          const delta = vecSub(playerPos, position);
          const range = size * 5;

          const closestEdge: Vector = vecAdd(position, [
            clamp(-range, range, delta[0]),
            clamp(-range, range, delta[1]),
            clamp(-range, range, delta[2]),
          ]);

          // when not crouched, remove a brick
          // if (!crouched) {
          const subcubes =
            half <= 1 ? [] : getSubCubes(half, position, closestEdge);

          Omegga.clearRegion(region);
          if (data && subcubes.length > 0) {
            Omegga.loadSaveData(
              {
                ...data,
                bricks: [
                  ...subcubes.map(cube => ({ ...data.bricks[0], ...cube })),
                ],
              },
              { quiet: true }
            );
          }
          /* } else {
            const maxDelta = Math.max(...delta.map(Math.abs));
            const normalAxis = delta.findIndex(v => Math.abs(v) === maxDelta);
            const direction = Math.sign(delta[normalAxis]);

            const normal = Array.from({
              '0': 0,
              '1': 0,
              '2': 0,
              [normalAxis]: direction,
              length: 3,
            }) as Vector;
            // same as below but I chose darkness
            // normal = [0, 0, 0]
            // normal[normalAxis] = direction

            Omegga.loadSaveData(
              {
                ...data,
                bricks: [
                  {
                    ...data.bricks[0],
                    size: [10, 10, 10],
                    position: vecAdd(closestEdge, vecScale(normal, 10)).map(
                      (p, i) => Math.round(p / 10) * 10
                    ) as Vector,
                  },
                ],
              },
              { quiet: true }
            );
          } */
        } catch (err) {
          console.error(err);
        }
      }
    );

    return {};
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
