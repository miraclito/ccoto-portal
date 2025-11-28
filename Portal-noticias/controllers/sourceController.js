const { Source, Category } = require('../models');
const GenericScraper = require('../scrapers/genericScraper');

// Obtener fuentes (Admin ve todas, Premium ve las suyas)
exports.getSources = async (req, res) => {
    try {
        let where = {};
        // Si no es admin, solo ve sus propias fuentes
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }

        const sources = await Source.findAll({ where });
        res.json(sources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear nueva fuente (con límites para Premium y Free)
exports.createSource = async (req, res) => {
    try {
        // Verificar límites según el plan (si no es admin)
        if (req.user.role !== 'admin') {
            const count = await Source.count({ where: { userId: req.user.id } });

            // Límite para Premium: 3 fuentes
            if (req.user.plan === 'premium' && count >= 3) {
                return res.status(403).json({
                    message: 'Has alcanzado el límite de 3 fuentes para tu plan Premium.'
                });
            }

            // Límite para Free: 1 fuente
            if ((!req.user.plan || req.user.plan === 'free') && count >= 1) {
                return res.status(403).json({
                    message: 'Has alcanzado el límite de 1 fuente para tu plan Gratuito. ¡Hazte Premium para más!'
                });
            }
        }

        const sourceData = {
            ...req.body,
            userId: req.user.id // Asignar al usuario actual
        };

        const source = await Source.create(sourceData);
        res.status(201).json(source);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar fuente
exports.updateSource = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Source.update(req.body, { where: { id } });
        if (updated) {
            const updatedSource = await Source.findByPk(id);
            res.json(updatedSource);
        } else {
            res.status(404).json({ message: 'Fuente no encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar fuente
exports.deleteSource = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Source.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: 'Fuente eliminada' });
        } else {
            res.status(404).json({ message: 'Fuente no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Probar configuración de scraper
exports.testScraper = async (req, res) => {
    try {
        const { url, selectors } = req.body;

        // Simular un objeto Source
        const tempSource = {
            name: 'Test Scraper',
            url,
            selectors
        };

        // Obtener categoría por defecto
        const category = await Category.findOne();

        const scraper = new GenericScraper(tempSource, category?.id || 1);

        // Sobrescribir saveNews para no guardar en BD durante el test
        scraper.saveNews = async (newsData) => {
            return newsData; // Solo devolver los datos
        };

        console.log('🧪 Probando scraper:', url);
        const results = await scraper.scrape();

        res.json({
            success: true,
            count: results.length,
            results: results.slice(0, 5) // Devolver solo los primeros 5 para preview
        });

    } catch (error) {
        console.error('❌ Error testing scraper:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
