import 'dotenv/config'
import OpenAI from 'openai'
const c = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const list = await c.models.list()
const ids = list.data.map(m => m.id)
  .filter(id => /^(gpt-|o\d|chatgpt)/.test(id))
  .filter(id => !/audio|realtime|transcribe|tts|image|search-preview|moderation|embedding/.test(id))
  .sort()
console.log('Relevante Text-Modelle in deinem Account:')
for (const id of ids) console.log('  ', id)
