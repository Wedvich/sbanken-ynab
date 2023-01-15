import * as utils from './utils';

describe('stripEmojis', () => {
  it('strips emojis from a string', () => {
    const text = '💰 stonks 📈';

    const result = utils.stripEmojis(text);

    expect(result).toBe(' stonks ');
  });
});
