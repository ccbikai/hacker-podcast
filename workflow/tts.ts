import { Buffer } from 'node:buffer'
import { synthesize } from '@echristian/edge-tts'

interface Env extends CloudflareEnv {
  TTS_PROVIDER?: string
  TTS_API_URL?: string
  TTS_API_ID?: string
  TTS_API_KEY?: string
  MAN_VOICE_ID?: string
  WOMAN_VOICE_ID?: string
  AUDIO_SPEED?: string
}

async function edgeTTS(text: string, gender: string, env: Env) {
  const { audio } = await synthesize({
    text,
    language: 'en-US',
    voice: gender === 'M' ? (env.MAN_VOICE_ID || 'en-GB-ThomasNeural') : (env.WOMAN_VOICE_ID || 'en-IE-EmilyNeural'),
    rate: env.AUDIO_SPEED || '10%',
  })
  return audio
}

async function minimaxTTS(text: string, gender: string, env: Env) {
  const res = await fetch(`${env.TTS_API_URL || 'https://api.minimaxi.chat/v1/t2a_v2'}?GroupId=${env.TTS_API_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TTS_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'speech-02-turbo',
      text,
      timber_weights: [
        {
          voice_id: gender === 'M' ? (env.MAN_VOICE_ID || 'English_Aussie_Bloke') : (env.WOMAN_VOICE_ID || 'English_SentimentalLady'),
          weight: 100,
        },
      ],
      voice_setting: {
        voice_id: '',
        speed: Number(env.AUDIO_SPEED || 1.1),
        pitch: 0,
        vol: 1,
        latex_read: false,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
      language_boost: 'English',
    }),
  })

  if (res.ok) {
    const result: { data: { audio: string }, base_resp: { status_msg: string } } = await res.json()
    if (result?.data?.audio) {
      const buffer = Buffer.from(result.data.audio, 'hex')
      return new Blob([buffer.buffer], { type: 'audio/mpeg' })
    }
    throw new Error(`Failed to fetch audio: ${result?.base_resp?.status_msg}`)
  }
  throw new Error(`Failed to fetch audio: ${res.statusText}`)
}

export default function (text: string, gender: string, env: Env) {
  if (env.TTS_PROVIDER === 'minimax') {
    return minimaxTTS(text, gender, env)
  }
  return edgeTTS(text, gender, env)
}
