import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

import { createUniverseStore } from '../../src/state/universe-store.ts';
import type { UniverseState } from '../../src/state/universe-store.ts';
import { ROCKET_ON_PAD } from '../../src/ui/rocket.ts';
import {
  FLICKER_MS,
  flightX,
  FLYING_WIDTH,
  ON_PAD_WIDTH,
  padX,
  SCENE_ROWS,
  sceneModeOf,
  sceneRows,
  spriteFrame,
  spritePosition,
  STAR_GLYPHS,
  starsFor,
  twinkleLevel,
  TWINKLE_MS,
} from '../../src/ui/scene.ts';
import { OLIVE } from '../../src/ui/theme.ts';
import { makeFrame } from '../support/frames.ts';

const plain = (rows: readonly string[]): string[] =>
  rows.map((row) => stripVTControlCharacters(row));

const universesSeenAt = (lastSeen: number): readonly UniverseState[] => {
  const store = createUniverseStore();
  store.update(makeFrame({ portAddress: 1 }), '2.0.0.10', lastSeen);
  return store.snapshot(lastSeen).universes;
};

describe('sceneModeOf', () => {
  it('waits on the pad when there is no Art-Net at all', () => {
    assert.equal(sceneModeOf([], 1000), 'waiting');
  });

  it('flies while any universe is live', () => {
    assert.equal(sceneModeOf(universesSeenAt(1000), 2000), 'flying');
  });

  it('goes back to the pad when the universes go quiet', () => {
    assert.equal(sceneModeOf(universesSeenAt(1000), 5000), 'waiting');
  });
});

describe('flightX', () => {
  it('starts just off the left edge', () => {
    assert.equal(flightX(0, 80), -FLYING_WIDTH);
  });

  it('moves 30 columns per second', () => {
    assert.equal(flightX(1000, 80) - flightX(0, 80), 30);
  });

  it('comes back on the left after leaving on the right', () => {
    const width = 90 - FLYING_WIDTH;
    assert.equal(flightX(2999, width), width - 1);
    assert.equal(flightX(3000, width), -FLYING_WIDTH);
  });
});

describe('spritePosition', () => {
  it('stands still in the middle while waiting', () => {
    const first = spritePosition('waiting', 0, 80);
    assert.deepEqual(spritePosition('waiting', 5000, 80), first);
    assert.equal(first.x, padX(80));
    assert.equal(padX(80), Math.floor((80 - ON_PAD_WIDTH) / 2));
  });

  it('stands on the bottom of the scene while waiting', () => {
    const { y } = spritePosition('waiting', 0, 80);
    assert.equal(y + ROCKET_ON_PAD.length, SCENE_ROWS * 2);
  });

  it('flies through the middle of the scene', () => {
    const { y } = spritePosition('flying', 0, 80);
    const height = spriteFrame('flying', 0).length;
    assert.equal(y, Math.floor((SCENE_ROWS * 2 - height) / 2));
  });
});

describe('spriteFrame', () => {
  it('flickers its flame while flying', () => {
    assert.notDeepEqual(
      spriteFrame('flying', 0),
      spriteFrame('flying', FLICKER_MS),
    );
    assert.deepEqual(
      spriteFrame('flying', 0),
      spriteFrame('flying', FLICKER_MS * 2),
    );
  });

  it('stands still on the pad while waiting', () => {
    assert.equal(spriteFrame('waiting', 0), ROCKET_ON_PAD);
    assert.equal(spriteFrame('waiting', 5000), ROCKET_ON_PAD);
  });
});

describe('starsFor', () => {
  it('places one star per 7 columns, inside the scene', () => {
    const stars = starsFor(70);
    assert.equal(stars.length, 10);
    for (const star of stars) {
      assert.ok(star.x >= 0 && star.x < 70);
      assert.ok(star.row >= 0 && star.row < SCENE_ROWS);
    }
  });

  it('puts the stars in the same places every time', () => {
    assert.deepEqual(starsFor(70), starsFor(70));
  });
});

describe('twinkleLevel', () => {
  const star = { x: 0, row: 0, phase: 0 };

  it('is dark at the start of a twinkle and brightest in the middle', () => {
    assert.equal(twinkleLevel(star, 0), 0);
    assert.equal(twinkleLevel(star, TWINKLE_MS / 2), STAR_GLYPHS.length - 1);
  });

  it('repeats every twinkle period', () => {
    assert.equal(twinkleLevel(star, 700), twinkleLevel(star, 700 + TWINKLE_MS));
  });
});

describe('sceneRows', () => {
  const sceneAt = (mode: 'flying' | 'waiting', now: number): string[] =>
    plain(sceneRows({ mode, now, width: 60, theme: OLIVE }));

  it('is 6 rows tall and as wide as the window', () => {
    const rows = sceneAt('waiting', 0);
    assert.equal(rows.length, SCENE_ROWS);
    assert.ok(rows.every((row) => row.length === 60));
  });

  it('shows twinkling stars only while waiting', () => {
    const stars = /[.+*]/u;
    const waiting = Array.from({ length: 24 }, (_, step) =>
      sceneAt('waiting', step * 100).join(''),
    );
    assert.ok(waiting.some((frame) => stars.test(frame)));
    assert.notEqual(waiting[0], waiting[6]);
  });

  it('leaves a trail of speed lines while flying', () => {
    const frame = sceneAt('flying', 1000).join('\n');
    assert.match(frame, /-{3,}/u);
    assert.doesNotMatch(frame, /[+*]/u);
  });

  it('moves the rocket between frames', () => {
    assert.notDeepEqual(sceneAt('flying', 0), sceneAt('flying', 500));
  });
});
