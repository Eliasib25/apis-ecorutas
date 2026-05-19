const Route = require('../models/Route');
const Zone = require('../models/Zone');
const { getConnection } = require('../config/database');

const seedController = {
  seed: async (req, res) => {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const route1Id = await Route.create({
        identification: 1,
        name: 'Ruta 1',
        frecuency: 'L-M-V',
        startTime: '08:00 a.m.',
        isActive: 'si'
      }, connection);

      const route2Id = await Route.create({
        identification: 2,
        name: 'Ruta 2',
        frecuency: 'M-J-S',
        startTime: '06:00 a.m.',
        isActive: 'si'
      }, connection);

      const zones = [
        { name: 'Las Margaritas', routeidentification: route1Id },
        { name: 'Florencia', routeidentification: route1Id },
        { name: 'Ipanema', routeidentification: route2Id },
        { name: 'Las Americas', routeidentification: route2Id }
      ];

      for (const zone of zones) {
        await Zone.create(zone, connection);
      }

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Datos de seed insertados correctamente',
        data: {
          routes: [
            { id: route1Id, name: 'Ruta 1' },
            { id: route2Id, name: 'Ruta 2' }
          ],
          zones: zones
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error en seed:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
};

module.exports = seedController;
