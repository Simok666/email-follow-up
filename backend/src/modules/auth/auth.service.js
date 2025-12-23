const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuid4 } = require('uuid')
const pool = require('../../config/db')
const prisma = require('../../config/prisma')

const SALT_ROUNDS = 10


async function register ({ email, password }) {
    try {

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const user = await prisma.user.create({
            data : {
                id: uuid4(),
                email,
                password: hashedPassword
            },
            select : {
                id: true,
                email: true,
                plan: true,
                createdAt: true
            }
        })

        return user

    } catch (e) {
        if (e.code === 'P2002') {
            throw new Error('Email already exists')
        } 
    }
}

async function login({ email, password }) {
    const user = await prisma.user.findUnique({
        where : {
            email
        }
    })

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