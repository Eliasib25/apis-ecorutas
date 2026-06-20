const Route = require('../models/Route');
const Zone = require('../models/Zone');
const Truck = require('../models/Truck');
const User = require('../models/User');
const { getConnection } = require('../config/database');

const seedController = {
  seed: async (req, res) => {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const route1Id = await Route.create({
        identification: 1,
        name: 'Ruta 1',
        frecuency: 'Lun-Mie-Vie',
        startTime: '08:00 a.m.',
        isActive: 'si'
      }, connection);

      const route2Id = await Route.create({
        identification: 2,
        name: 'Ruta 2',
        frecuency: 'Mar-Jue-Sab',
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

      const truck1Id = await Truck.create({
        plate: 'ABC-123',
        capacityKg: 10000,
        conditionTruck: 'disponible'
      }, connection);

      const truck2Id = await Truck.create({
        plate: 'DEF-456',
        capacityKg: 8000,
        conditionTruck: 'disponible'
      }, connection);

      await Route.assignTruck(route1Id, truck1Id, connection);
      await Route.assignTruck(route2Id, truck2Id, connection);

      const adminUser = await User.create({
        identificationtype: 'CC',
        identification: '10001000',
        names: 'Admin',
        lastnames: 'EcoRutas',
        email: 'admin@ecorutas.com',
        phone: '3001234567',
        address: 'Calle 10 #5-20',
        neighborhood: 'Centro',
        role: 'admin',
        userName: 'admin',
        password: 'Admin123*'
      });

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Datos de seed insertados correctamente',
        data: {
          routes: [
            { id: route1Id, name: 'Ruta 1' },
            { id: route2Id, name: 'Ruta 2' }
          ],
          zones: zones,
          trucks: [
            { id: truck1Id, plate: 'ABC-123', capacityKg: 10000 },
            { id: truck2Id, plate: 'DEF-456', capacityKg: 8000 }
          ],
          admin: {
            identificationtype: 'CC',
            identification: '10001000',
            userName: 'admin',
            role: 'admin'
          }
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
