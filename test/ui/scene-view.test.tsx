import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

import { render } from 'ink-testing-library';
import type { ReactElement } from 'react';

import { SceneView } from '../../src/ui/scene-view.tsx';
import { OLIVE } from '../../src/ui/theme.ts';

const frameOf = (element: ReactElement): string => {
  const { lastFrame, unmount } = render(element);
  const frame = lastFrame() ?? '';
  unmount();
  return frame;
};

describe('SceneView', () => {
  it('draws 6 rows', () => {
    const frame = frameOf(
      <SceneView mode="waiting" now={0} width={60} theme={OLIVE} />,
    );
    assert.equal(stripVTControlCharacters(frame).split('\n').length, 6);
  });

  it('matches the waiting screenshot', (t) => {
    t.assert.snapshot(
      frameOf(<SceneView mode="waiting" now={1200} width={60} theme={OLIVE} />),
    );
  });

  it('matches the flying screenshot', (t) => {
    t.assert.snapshot(
      frameOf(<SceneView mode="flying" now={1000} width={60} theme={OLIVE} />),
    );
  });
});
