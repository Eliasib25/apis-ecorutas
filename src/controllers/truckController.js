const Truck = require('../models/Truck');

const truckController = {
  list: async (req, res) => {
    try {
      const trucks = await Truck.findAll();

      return res.status(200).json({
        success: true,
        message: 'Camiones obtenidos correctamente',
        data: {
          trucks: trucks
        }
      });
    } catch (error) {
      console.error('Error en list trucks:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const { plate, capacityKg, conditionTruck } = req.body;

      if (!plate || plate.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La placa es requerida'
        });
      }

      if (!capacityKg || capacityKg <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad es requerida y debe ser mayor a 0'
        });
      }

      if (conditionTruck && !['disponible', 'En mantenimiento', 'fuera de servicio'].includes(conditionTruck)) {
        return res.status(400).json({
          success: false,
          message: 'La condición debe ser: disponible, En mantenimiento o fuera de servicio'
        });
      }

      const truck = await Truck.create({ plate: plate.trim(), capacityKg, conditionTruck });

      return res.status(201).json({
        success: true,
        message: 'Camión registrado correctamente',
        data: {
          truck: truck
        }
      });
    } catch (error) {
      console.error('Error en create truck:', error);
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
      const { plate, capacityKg, conditionTruck } = req.body;

      const existing = await Truck.findById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Camión no encontrado'
        });
      }

      if (plate !== undefined && plate.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La placa no puede estar vacía'
        });
      }

      if (capacityKg !== undefined && capacityKg <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad debe ser mayor a 0'
        });
      }

      if (conditionTruck !== undefined && !['disponible', 'En mantenimiento', 'fuera de servicio'].includes(conditionTruck)) {
        return res.status(400).json({
          success: false,
          message: 'La condición debe ser: disponible, En mantenimiento o fuera de servicio'
        });
      }

      const fields = {};
      if (plate !== undefined) fields.plate = plate.trim();
      if (capacityKg !== undefined) fields.capacityKg = capacityKg;
      if (conditionTruck !== undefined) fields.conditionTruck = conditionTruck;

      const truck = await Truck.update(parseInt(id), fields);

      return res.status(200).json({
        success: true,
        message: 'Camión actualizado correctamente',
        data: {
          truck: truck
        }
      });
    } catch (error) {
      console.error('Error en update truck:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = truckController;
