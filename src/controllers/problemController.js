const Problem = require('../models/Problem');

const problemController = {
  list: async (req, res) => {
    try {
      const problems = await Problem.findAll();

      return res.status(200).json({
        success: true,
        message: 'Problemas obtenidos correctamente',
        data: {
          problems: problems
        }
      });
    } catch (error) {
      console.error('Error en list problems:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido'
        });
      }

      const problem = await Problem.create(name.trim());

      return res.status(201).json({
        success: true,
        message: 'Problema creado correctamente',
        data: {
          problem: problem
        }
      });
    } catch (error) {
      console.error('Error en create problem:', error);
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
      const { name, state } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido'
        });
      }

      if (!state || !['activo', 'inactivo'].includes(state)) {
        return res.status(400).json({
          success: false,
          message: 'El estado debe ser activo o inactivo'
        });
      }

      const existing = await Problem.findAll();
      const problemExists = existing.find(p => p.identification === parseInt(id));

      if (!problemExists) {
        return res.status(404).json({
          success: false,
          message: 'Problema no encontrado'
        });
      }

      const problem = await Problem.update(parseInt(id), name.trim(), state);

      return res.status(200).json({
        success: true,
        message: 'Problema actualizado correctamente',
        data: {
          problem: problem
        }
      });
    } catch (error) {
      console.error('Error en update problem:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = problemController;
