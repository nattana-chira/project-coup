export default class Card {
  id = null
  name = null

  constructor(id, name) {
    this.id = id
    this.name = name
  }

  showName() {
    return masterTrans[this.name]?.name
  }
}

export const replaceTrans = (msg, reverse = false) => {
  Object.keys(masterTrans).forEach(function(key) {
    if (reverse)
      msg = msg.replace(key, masterTrans[key].name)
    else 
      msg = msg.replace(masterTrans[key].name, key)
  })

  return msg
}

const masterTrans = {
  duke: { name: "Duke", desc: null },
  assassin: { name: "Assassin", desc: null },
  ambassador: { name: "Ambassador", desc: null },
  captain: { name: "Captain", desc: null },
  contessa: { name: "Contessa", desc: null },
  inquisitor: { name: "Inquisitor", desc: null },

  work: { name: "ทำงาน", desc: null },
  donate: { name: "รับบริจาค", desc: null },
  coup: { name: "ยึดอำนาจ", desc: null },
  protest: { name: "ประท้วง", desc: null },
}

export const masterDeck = [
  new Card(1, "duke"),
  new Card(2, "duke"),
  new Card(3, "duke"),

  new Card(4, "assassin"),
  new Card(5, "assassin"),
  new Card(6, "assassin"),

  new Card(7, "ambassador"),
  new Card(8, "ambassador"),
  new Card(9, "ambassador"),

  new Card(10, "captain"),
  new Card(11, "captain"),
  new Card(12, "captain"),

  new Card(13, "contessa"),
  new Card(14, "contessa"),
  new Card(15, "contessa"),

  new Card(16, "inquisitor"),
  new Card(17, "inquisitor"),
  new Card(18, "inquisitor"),
]

export const mapMasterDeck = (cardId) => masterDeck.find(card => card.id === cardId)

export const shuffleDeck = (deck) => {
  const _deck = [...deck].sort(() => Math.random() - 0.5)
  return _deck
}

export const initDeck = masterDeck.map((card) => card.id)
