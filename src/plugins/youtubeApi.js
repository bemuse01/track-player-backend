import fp from 'fastify-plugin'
import { google } from 'googleapis'
import 'dotenv/config'


const youtubeApi = fp(async (fastify, options) => {
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
    })

    fastify.decorate('youtube', youtube)
})


export default youtubeApi