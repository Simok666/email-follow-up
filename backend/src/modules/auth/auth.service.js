const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuid4 } = require('uuid')
const pool = require('../../config/db')

const SALT_ROUNDS = 10


async function register ({ email, password }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const result = await pool.query(
        `
            INSERT INTO users (id, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, email, plan, created_at
        `,
        [uuid4(), email, hashedPassword]
    )

    return result.rows[0]
}

async function login({ email, password }) {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    )

    const user = result.rows[0]
    if (!user) throw new Error('Invalid Credentials')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid credentials')

    const token = jwt.sign(
        { userId: user.id, email: user.email, plan: user.plan },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return {
        token,
        user: {
        id: user.id,
        email: user.email,
        plan: user.plan
        }
    }
}

module.exports = {
  register,
  login
}