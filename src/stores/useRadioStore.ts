import { create } from 'zustand'

export interface RadioStation {
  id: string
  name: string
  genre: string
  streamUrl: string
}

// SomaFM — ad-free, listener-supported, CORS: Access-Control-Allow-Origin: *
// Full list: https://somafm.com/channels/
export const radioStations: RadioStation[] = [
  // High energy / workout
  { id: 'poptron', name: 'PopTron', genre: 'Pop / Dance', streamUrl: 'https://ice1.somafm.com/poptron-128-mp3' },
  { id: 'thetrip', name: 'The Trip', genre: 'Trance / House', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3' },
  { id: 'dubstep', name: 'Dub Step Beyond', genre: 'Bass / Dubstep', streamUrl: 'https://ice1.somafm.com/dubstep-128-mp3' },
  { id: 'metal', name: 'Metal Detector', genre: 'Heavy Metal', streamUrl: 'https://ice1.somafm.com/metal-128-mp3' },
  { id: 'defcon', name: 'DEF CON Radio', genre: 'Electronic / Hacker', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'deepspaceone', name: 'Deep Space One', genre: 'Deep House', streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3' },

  // Medium energy
  { id: 'fluid', name: 'Fluid', genre: 'Hip Hop / Beats', streamUrl: 'https://ice1.somafm.com/fluid-128-mp3' },
  { id: 'indiepop', name: 'Indie Pop Rocks', genre: 'Indie / Rock', streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3' },
  { id: 'beatblender', name: 'Beat Blender', genre: 'Deep House Mix', streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3' },
  { id: 'seventies', name: "Left Coast 70s", genre: '70s Rock', streamUrl: 'https://ice1.somafm.com/seventies-128-mp3' },
  { id: 'underground80s', name: 'Underground 80s', genre: '80s New Wave', streamUrl: 'https://ice1.somafm.com/underground80s-128-mp3' },
  { id: 'synphaera', name: 'Synphaera', genre: 'Synthwave', streamUrl: 'https://ice1.somafm.com/synphaera-128-mp3' },

  // Chill / cooldown
  { id: 'groovesalad', name: 'Groove Salad', genre: 'Chill / Ambient', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'lush', name: 'Lush', genre: 'Calm Electronic', streamUrl: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'spacestation', name: 'Space Station', genre: 'Ambient / Midtempo', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3' },
  { id: 'dronezone', name: 'Drone Zone', genre: 'Atmospheric', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'vaporwaves', name: 'Vaporwaves', genre: 'Vaporwave', streamUrl: 'https://ice1.somafm.com/vaporwaves-128-mp3' },
  { id: 'thistle', name: 'ThistleRadio', genre: 'Celtic / Folk', streamUrl: 'https://ice1.somafm.com/thistle-128-mp3' },
]

interface RadioState {
  isPlaying: boolean
  currentStation: RadioStation | null
  volume: number
  isMuted: boolean
  audio: HTMLAudioElement | null
  panelOpen: boolean
  play: (station: RadioStation) => void
  stop: () => void
  togglePlay: () => void
  toggleMute: () => void
  setVolume: (volume: number) => void
  togglePanel: () => void
}

export const useRadioStore = create<RadioState>((set, get) => ({
  isPlaying: false,
  currentStation: null,
  volume: 0.7,
  isMuted: false,
  audio: null,
  panelOpen: false,

  play: (station) => {
    const { audio: prevAudio } = get()
    if (prevAudio) {
      prevAudio.pause()
      prevAudio.src = ''
    }

    const audio = new Audio(station.streamUrl)
    audio.volume = get().isMuted ? 0 : get().volume
    audio.play().catch(() => {})

    set({ audio, currentStation: station, isPlaying: true })
  },

  stop: () => {
    const { audio } = get()
    if (audio) {
      audio.pause()
      audio.src = ''
    }
    set({ isPlaying: false, currentStation: null, audio: null })
  },

  togglePlay: () => {
    const { audio, isPlaying, currentStation } = get()
    if (!audio || !currentStation) return

    if (isPlaying) {
      audio.pause()
      set({ isPlaying: false })
    } else {
      audio.play().catch(() => {})
      set({ isPlaying: true })
    }
  },

  toggleMute: () => {
    const { audio, isMuted, volume } = get()
    if (audio) audio.volume = isMuted ? volume : 0
    set({ isMuted: !isMuted })
  },

  setVolume: (volume) => {
    const { audio, isMuted } = get()
    if (audio && !isMuted) audio.volume = volume
    set({ volume })
  },

  togglePanel: () => {
    set(s => ({ panelOpen: !s.panelOpen }))
  },
}))
