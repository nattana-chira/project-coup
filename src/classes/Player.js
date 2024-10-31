export default class Player {
  name = null
  sessionId = null
  cardIds = []
  faceUpCardIds = []
  logDrawCardIds = []
  sitZone = null
  coin = 2

  constructor(name, sessionId, sitZone = null) {
    this.name = name
    this.sessionId = sessionId
    this.sitZone = sitZone
  }

  static showFullname(player) {
    return `${player?.name} (${player?.sessionId})`
  }
}

export const initPlayers = [
  // new Player("Drink", "254686", 1),
  // new Player("Somchai", "874957", 3),
  // new Player("C0", "632001", 5)
]

export const randomSitZone = (_players) => {
  let players = [..._players].sort(() => Math.random() - 0.5)

  players = players.sort((a, b) => a.sitZone - b.sitZone)

  return players
}