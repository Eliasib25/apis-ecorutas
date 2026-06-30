/**
 * Setup centralizado de pruebas.
 * Exporta funciones mock que cada test file usa
 * para configurar jest.mock de database.js.
 */

const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({
  query: mockQuery,
  release: mockRelease,
});

module.exports = { mockQuery, mockRelease, mockGetConnection };
