import { toLowerCamelCase, toUnderScoreCase } from './index';

const underScores = [
  1,
  'str',
  1.1,
  true,
  false,
  undefined,
  { aa_aa: 1, bb_bb: 'str', cc_cc: { cc_cc: 1 }, dd_dd: [{ dd_dd: 1 }, 1] },
  [1, 'str', { cc_cc: 1 }, [{ dd_dd: 1 }, 1]],
];

const lowerCamels = [
  1,
  'str',
  1.1,
  true,
  false,
  undefined,
  { aaAa: 1, bbBb: 'str', ccCc: { ccCc: 1 }, ddDd: [{ ddDd: 1 }, 1] },
  [1, 'str', { ccCc: 1 }, [{ ddDd: 1 }, 1]],
];

describe('toLowerCamelCase', () => {
  it('conversion', () => {
    expect(toLowerCamelCase(underScores)).toEqual(lowerCamels);
    for (let i = 0; i < underScores.length; i++) {
      expect(toLowerCamelCase(underScores[i])).toEqual(lowerCamels[i]);
    }
  });
});

describe('toUnderScoreCase', () => {
  it('conversion', () => {
    expect(toUnderScoreCase(lowerCamels)).toEqual(underScores);
    for (let i = 0; i < lowerCamels.length; i++) {
      expect(toUnderScoreCase(lowerCamels[i])).toEqual(underScores[i]);
    }
  });
});
