const Route = require('../models/Route');
const Zone = require('../models/Zone');
const Truck = require('../models/Truck');
const { getConnection } = require('../config/database');
const routeSimulator = require('../services/routeSimulator');

const routeController = {
  list: async (req, res) => {
    try {
      const routes = await Route.findAllWithDetails();

      return res.status(200).json({
        success: true,
        message: 'Rutas obtenidas correctamente',
        data: {
          routes
        }
      });
    } catch (error) {
      console.error('Error en list routes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, frecuency, startTime, truckIdentification, zoneIds } = req.body;

      const truck = await Truck.findById(parseInt(truckIdentification));
      if (!truck) {
        return res.status(404).json({
          success: false,
          message: 'Camion no encontrado'
        });
      }

      const connection = await getConnection();
      try {
        await connection.beginTransaction();

        const newRouteId = await Route.createRoute(
          {
            name: name.trim(),
            frecuency,
            startTime,
            isActive: 'Si',
            truckIdentification: parseInt(truckIdentification),
          },
          zoneIds || [],
          connection
        );

        await connection.query(
          "UPDATE truck SET conditionTruck = 'asignado' WHERE identification = ?",
          [parseInt(truckIdentification)]
        );

        await connection.commit();

        const route = await Route.findById(newRouteId);

        return res.status(201).json({
          success: true,
          message: 'Ruta creada correctamente',
          data: {
            route: {
              ...route,
              zones: zoneIds || [],
            }
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error en create route:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, frecuency, startTime, isActive, truckIdentification, zoneIds } = req.body;

      const existing = await Route.findById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Ruta no encontrada'
        });
      }

      if (name !== undefined && name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacio'
        });
      }

      if (frecuency !== undefined && !['Lun-Mie-Vie', 'Mar-Jue-Sab'].includes(frecuency)) {
        return res.status(400).json({
          success: false,
          message: 'La frecuencia debe ser Lun-Mie-Vie o Mar-Jue-Sab'
        });
      }

      if (truckIdentification !== undefined) {
        const truck = await Truck.findById(parseInt(truckIdentification));
        if (!truck) {
          return res.status(404).json({
            success: false,
            message: 'Camion no encontrado'
          });
        }
      }

      const connection = await getConnection();
      try {
        await connection.beginTransaction();

        const oldTruckId = existing.truckIdentification;
        const newTruckId = truckIdentification !== undefined ? parseInt(truckIdentification) : undefined;

        if (newTruckId !== undefined && oldTruckId !== newTruckId) {
          if (oldTruckId) {
            await connection.query(
              "UPDATE truck SET conditionTruck = 'disponible' WHERE identification = ? AND conditionTruck = 'asignado'",
              [oldTruckId]
            );
          }
          await connection.query(
            "UPDATE truck SET conditionTruck = 'asignado' WHERE identification = ?",
            [newTruckId]
          );
        }

        await Route.updateRoute(
          parseInt(id),
          {
            name: name !== undefined ? name.trim() : undefined,
            frecuency,
            startTime,
            isActive,
            truckIdentification: newTruckId !== undefined ? newTruckId : undefined,
          },
          zoneIds !== undefined ? zoneIds : undefined,
          connection
        );

        await connection.commit();

        const updated = await Route.findById(parseInt(id));
        const zones = await Zone.findAll();
        const routeZones = zones
          .filter(z => z.routeidentification === parseInt(id))
          .map(z => z.name);

        return res.status(200).json({
          success: true,
          message: 'Ruta actualizada correctamente',
          data: {
            route: {
              ...updated,
              zones: routeZones,
            }
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error en update route:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  availableZones: async (req, res) => {
    try {
      const { routeId } = req.query;
      const connection = await getConnection();
      try {
        let query = 'SELECT identification, name FROM zone WHERE routeidentification IS NULL';
        const params = [];

        if (routeId) {
          query += ' OR routeidentification = ?';
          params.push(parseInt(routeId));
        }

        query += ' ORDER BY name';

        const [rows] = await connection.query(query, params);

        return res.status(200).json({
          success: true,
          message: 'Zonas disponibles obtenidas correctamente',
          data: {
            zones: rows
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error en availableZones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  availableTrucks: async (req, res) => {
    try {
      const connection = await getConnection();
      try {
        const [rows] = await connection.query(
          `SELECT t.identification, t.plate, t.capacityKg, t.conditionTruck
           FROM truck t
           LEFT JOIN route r ON r.truckIdentification = t.identification
           WHERE r.identification IS NULL
             AND t.conditionTruck IN ('disponible', 'En mantenimiento')
           ORDER BY t.plate`
        );

        return res.status(200).json({
          success: true,
          message: 'Camiones disponibles obtenidos correctamente',
          data: {
            trucks: rows
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error en availableTrucks:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  startRoute: async (req, res) => {
    try {
      const { id } = req.params;
      await routeSimulator.start(String(id));

      return res.status(200).json({
        success: true,
        message: 'Simulacion iniciada'
      });
    } catch (error) {
      console.error('Error en startRoute:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error en el servidor',
        error: error.message
      });
    }
  },

  stopRoute: async (req, res) => {
    try {
      const { id } = req.params;
      await routeSimulator.stop(String(id));

      return res.status(200).json({
        success: true,
        message: 'Simulacion detenida'
      });
    } catch (error) {
      console.error('Error en stopRoute:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = routeController;
