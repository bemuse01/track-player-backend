import fp from 'fastify-plugin'
import 'dotenv/config'

// To access plugin like fastify.plugin, must be wrapped by fp
const testPlugin = fp((fastify, option) => {
    fastify.decorate('testplugin', () => {})
})

export default testPlugin
