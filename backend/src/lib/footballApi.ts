import axios from 'axios'

export const footballApi = axios.create({
  baseURL: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY || '',
  },
})
