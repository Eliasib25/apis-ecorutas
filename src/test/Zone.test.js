const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Zone = require('../models/Zone');

describe('Modelo Zone - HU01, HU06', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('HU01-06: Buscar barrio existente', async () => {
    mockQuery.mockResolvedValueOnce([[{ routeidentification: 1 }], []]);

    const result = await Zone.findRouteIdByZoneName('Las Margaritas');

    expect(result).toBe(1);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT routeidentification FROM zone WHERE name = ? LIMIT 1',
      ['Las Margaritas']
    );
  });

  test('HU01-07: Buscar barrio inexistente', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const result = await Zone.findRouteIdByZoneName('BarrioFantasma');

    expect(result).toBeNull();
  });

  test('HU06-03: Listar todas las zonas', async () => {
    const mockZones = [
      { identification: 1, name: 'Las Margaritas', routeidentification: 1 },
      { identification: 2, name: 'Florencia', routeidentification: 1 },
      { identification: 3, name: 'Ipanema', routeidentification: 2 },
      { identification: 4, name: 'Las Americas', routeidentification: 2 },
    ];

    mockQuery.mockResolvedValueOnce([mockZones, []]);

    const result = await Zone.findAll();

    expect(result).toHaveLength(4);
    expect(result[0].name).toBe('Las Margaritas');
    expect(result[1].name).toBe('Florencia');
    expect(result[2].name).toBe('Ipanema');
    expect(result[3].name).toBe('Las Americas');
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM zone');
  });
});
