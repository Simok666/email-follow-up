const authService = require('./auth.service')

async function register(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' })
    }

    const user = await authService.register({ email, password })
    res.status(201).json(user)
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' })
    }
    res.status(500).json({ message: err.message })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

module.exports = {
  register,
  login
}
