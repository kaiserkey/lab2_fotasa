require('dotenv').config()

module.exports = {
    secret: process.env.AUTH_SECRET || 'ultrasecreto',
    expire: process.env.AUTH_EXPIRE || '24h',
    round: process.env.AUTH_ROUND || 10
}