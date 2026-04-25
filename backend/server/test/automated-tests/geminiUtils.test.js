const { extractGeminiText } = require('../../utilities/geminiUtils');

describe('extractGeminiText', () => {
  it('returns text from a single part', () => {
    const data = { candidates: [{ content: { parts: [{ text: 'Hello world' }] } }] };
    expect(extractGeminiText(data)).toBe('Hello world');
  });

  it('joins multiple parts into one string', () => {
    const data = { candidates: [{ content: { parts: [{ text: 'Hello' }, { text: ' world' }] } }] };
    expect(extractGeminiText(data)).toBe('Hello world');
  });

  it('trims leading and trailing whitespace', () => {
    const data = { candidates: [{ content: { parts: [{ text: '  trimmed  ' }] } }] };
    expect(extractGeminiText(data)).toBe('trimmed');
  });

  it('returns empty string when candidates is missing', () => {
    expect(extractGeminiText({})).toBe('');
  });

  it('returns empty string when parts array is empty', () => {
    const data = { candidates: [{ content: { parts: [] } }] };
    expect(extractGeminiText(data)).toBe('');
  });

  it('returns empty string when called with null', () => {
    expect(extractGeminiText(null)).toBe('');
  });

  it('returns empty string when called with undefined', () => {
    expect(extractGeminiText(undefined)).toBe('');
  });
});