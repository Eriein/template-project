const { buildSystemPrompt } = require('../../routes/movieChat');

describe('buildSystemPrompt', () => {
  it('includes the movie title and year', () => {
    const prompt = buildSystemPrompt({ title: 'Inception', year: '2010', plot: '', actors: '' });
    expect(prompt).toContain('Inception');
    expect(prompt).toContain('2010');
  });

  it('includes plot and actors in the prompt', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', plot: 'A desert planet.', actors: 'Timothée Chalamet' });
    expect(prompt).toContain('A desert planet.');
    expect(prompt).toContain('Timothée Chalamet');
  });

  it('falls back gracefully when title is missing', () => {
    const prompt = buildSystemPrompt({ year: '2021', plot: '', actors: '' });
    expect(prompt).toContain('this movie');
  });

  it('falls back gracefully when year is missing', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', plot: '', actors: '' });
    expect(prompt).toContain('year unknown');
  });

  it('falls back gracefully when plot is missing', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', actors: '' });
    expect(prompt).toContain('Plot unavailable.');
  });

  it('falls back gracefully when actors are missing', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', plot: 'A desert planet.' });
    expect(prompt).toContain('Cast unavailable.');
  });

  it('enforces the 2-3 sentence constraint in the prompt', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', plot: '', actors: '' });
    expect(prompt).toContain('2-3 sentences');
  });

  it('prohibits markdown formatting in the prompt', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', plot: '', actors: '' });
    expect(prompt).toContain('No bullet points');
    expect(prompt).toContain('no bold or markdown formatting');
  });

  it('restricts the scope to the specific movie', () => {
    const prompt = buildSystemPrompt({ title: 'Dune', year: '2021', plot: '', actors: '' });
    expect(prompt).toContain('redirect back');
  });
});
