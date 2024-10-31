import { initPlayers, randomSitZone } from './Player'
import { initDeck, shuffleDeck } from './Card'

let randomPlayers = randomSitZone(initPlayers)
const randomDeck = shuffleDeck(initDeck)
const emojis = randomPlayers.map(_player => ({
  sessionId: _player.sessionId,
  name: _player.name,
  emoji: null
}))

export const initState = {
  deck: randomDeck,
  players: randomPlayers,
  log: [],
  rule: {
    turnSessionId: "",
    trashDeck: [],
    battleZone: [],
    assassinCoin: 0
  },

  emojis: emojis
}