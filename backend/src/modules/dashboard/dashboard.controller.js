const dashboardService = require('./dashboard.service')

async function getStats(req, res){
    try {
    const userId = req.user.id

    const stats = await dashboardService.getDashboardStats(userId)

    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard stats' })
  }
}

module.exports = {
    getStats
}