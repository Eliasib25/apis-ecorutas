const Route = require('../models/Route');
const fs = require('fs');
const path = require('path');

const routeViewController = {
  renderRoutesView: async (req, res) => {
    try {
      const routes = await Route.getAllRoutes();
      const viewPath = path.join(__dirname, '../views/routes/index.html');
      const template = fs.readFileSync(viewPath, 'utf-8');
      const html = template.replace('__ROUTES__', JSON.stringify(routes));

      return res.status(200).send(html);
    } catch (error) {
      console.error('Error en renderRoutesView:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = routeViewController;
