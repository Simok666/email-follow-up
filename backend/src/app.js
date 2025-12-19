const express = require('express')
const cors = require('cors')
const pool = require('./config/db')

const authRoutes = require('./modules/auth/auth.routes')
const authMiddleware = require('./middlewares/auth.middleware')
const gmailRoutes = require('./modules/gmail/gmail.routes')
const campaignRoutes = require('./modules/campaign/campaign.routes')
const followupRoutes = require('./modules/followup/followup.routes')

const app = express()

app.use(cors())
app.use(express.json())

// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Backend running' })
// })

app.get('/db-test', async (req, res) => {
  const result = await pool.query('SELECT NOW()')
  res.json(result.rows[0])
})

app.use('/api/auth', authRoutes)
app.use('/api/gmail', gmailRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/followups', followupRoutes)

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})


module.exports = app
