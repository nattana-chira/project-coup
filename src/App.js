import './App.css'
import { useState, useEffect, useRef, Fragment } from "react"
import { initState } from './classes/DataInit'
import { DEV_MODE } from './classes/_InitSetting'
import classNames from "classnames"
import { fetchInitData, updateData, subscribeData, EMOJI_DOC } from './classes/ApiService'
import PlayerComponent from './components/PlayerComponent'
import PlayAudio from './classes/PlayAudio'
import { createArray, delay, randomIdOnlyNumber, sortRandom, stringContains } from './classes/Utils'
import Player, { randomSitZone } from './classes/Player'
import DebugTool from './components/DebugTool'
import { replaceTrans, shuffleDeck } from './classes/Card'
import { defaultEmojis } from './classes/Emoji'
import EndgameStats from './components/EndgameStats'

function App() {
  const queryParams = new URLSearchParams(window.location.search)
  const sessionId = queryParams.get("sessionId")
  const roomId = queryParams.get("roomId")
  const isAdmin = queryParams.get("user") === "admin"

  const [rule, setRule] = useState(null)
  const [players, setPlayers] = useState([])
  const [deck, setDeck] = useState([])
  const [log, setLog] = useState([])
  const [emojis, setEmojis] = useState([])

  const [yourName, setYourname] = useState("")
  const [isEmojiLoading, toggleEmojiLoading] = useState(false)
  const [lastAudioLog, setLastAudioLog] = useState("")
  const [endgameText, setEndgameText] = useState("")

  const modalTrigger = useRef()

  const mainState = { rule, players, deck, log }
  const me = players.find(player => player.sessionId === sessionId)
  const turnPlayer = players.find(player => player.sessionId === rule?.turnSessionId)
  const isPlayerSitAt = (sitZone) => players.find(_player => _player.sitZone === sitZone)
  const notLoggedIn = !sessionId || !me
  const isMyTurn = me && me?.sessionId === rule?.turnSessionId
  const isDying = me && me?.faceUpCardIds.length === 2 && me?.coin > 0

  const [lastLog] = log.slice(-1)

  useEffect(() => {
    if (DEV_MODE) {
      setPlayers(initState.players)
      setDeck(initState.deck)
      setRule(initState.rule)
      setLog(initState.log)

      setEmojis(initState.emojis)
    } else {
      // BASE DATA
      subscribeData((data) => {
        setPlayers(data.players)
        setDeck(data.deck)
        setRule(data.rule)
        setLog(data.log)
      }, { roomId })

      fetchInitData({ roomId }).then((data) => {
        setPlayers(data.players)
        setDeck(data.deck)
        setRule(data.rule)
        setLog(data.log)
      })

      // EMOJI DATA
      subscribeData((data) => {
        setEmojis(data.emojis)
      }, { roomId: EMOJI_DOC })

      fetchInitData({ roomId: EMOJI_DOC }).then((data) => {
        setEmojis(data.emojis)
      })
    }

  }, [])

  
  useEffect(() => {
    if (isMyTurn) {
      PlayAudio.turnStart()
    }
  }, [isMyTurn])

  useEffect(() => {
    let lastLog = log[log.length - 1]
    if (!lastLog) return () => { }
    if (lastLog.msg === lastAudioLog.msg) return () => { }

    const findLog = (txt, depth) => {
      return log.slice(depth).find(_log => _log.msg.includes(txt))
    }

    setLastAudioLog(lastLog)
    const notMyLog = lastLog.sessionId !== me?.sessionId

    if (stringContains(["หยิบ 1 เหรียญ", "หยิบ 2 เหรียญ", "หยิบ 3 เหรียญ", "หยิบเหรียญนักฆ่า"], lastLog.msg) && notMyLog)
      PlayAudio.coin()

    if (stringContains(["จ่าย 3 เหรียญ"], lastLog.msg) && notMyLog)
      PlayAudio.sword()

    if (stringContains(["จ่าย 7 เหรียญ"], lastLog.msg) && notMyLog)
      PlayAudio.coup()
    
    if (stringContains(["จั่วการ์ด", "มอบการ์ดให้", "คืนการ์ด"], lastLog.msg) && notMyLog) 
      PlayAudio.drawCard()

    if (stringContains(["ได้เริ่ม", "แสดงตัวเป็น", "ขโมย 2 เหรียญ"], lastLog.msg) && notMyLog)
      PlayAudio.open()

    if (lastLog.msg.includes("หงายการ์ด") && notMyLog) 
      PlayAudio.skillSuccess()
    
    if (findLog("ตายอย่างเวทนา", -2) && !findLog(Player.showFullname(me), -2)) 
      PlayAudio.dead()
    
    
    if (lastLog.msg.includes("ได้รับชัยชนะ")) {
      const alivePlayer = players.find(_player => _player.faceUpCardIds.length !== 2)

      if (alivePlayer?.sessionId === me?.sessionId) 
        showVictory()
      else
        showGameOver()
    }
  }, [log])

  const showVictory = () => {
    PlayAudio.victory()
    let msg = `<span class="green">VICTORY</span>`
    setEndgameText(msg)
    modalTrigger.current.click()
  }

  const showGameOver = () => {
    PlayAudio.gameOver()
    let msg = `<span class="red">DEFEAT</span>`
    setEndgameText(msg)
    modalTrigger.current.click()
  }

  const clearEmoji = () => {
    const state = { emojis }

    state.emojis = state.emojis.map(_emoji => {
      _emoji.emoji = null
      return _emoji
    })
    setEmojis([...state.emojis])
    
    delay(() => updateData({ emojis: state.emojis }, { roomId: EMOJI_DOC }))
  }

  const addLog = (state, msg) => {
    // let actor = me ? `<span class="bold">${Player.showFullname(me)}</span>:` : ""
    const myName = me?.name || ""
    const mySessionId = me?.sessionId || ""

    state.log = [...state.log, { name: myName, sessionId: mySessionId, msg }]
    setLog(state.log)
    return state.log
  }

  const drawCard = (number, player, state) => {
    if (state.deck.length < number) return false;

    const drawnCards = state.deck.slice(0, number);
    state.deck = state.deck.slice(number)
    setDeck(state.deck)

    const cardIds = [...player.cardIds, ...drawnCards]
    setPlayerCards(cardIds, player, state)
    return drawnCards
  }

  const setPlayerCards = (cardIds, player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.cardIds = cardIds
      }
      return _player
    })
    setPlayers(state.players)
  }

  const removeCoin = (state, number) => {
    return state.players.map(_player => {
      if (_player.sessionId === me.sessionId && _player.coin >= number) {
        _player.coin = _player.coin - number
      }
      return _player
    })
  }

  const endTurn = (state) => {
    const alivePlayers = state.players.filter(_player => _player.faceUpCardIds.length !== 2)
    let nextPlayer;

    alivePlayers.map((player, i) => {
      if (player.sessionId === me.sessionId) {
        nextPlayer = alivePlayers[i + 1] || alivePlayers[0]
        const nextSessionId = nextPlayer?.sessionId
        state.rule = { ...state.rule, turnSessionId: nextSessionId }
        setRule(state.rule)
      }
    })

    return nextPlayer
  }

  const actionClicked = (action) => {
    const state = { log }

    PlayAudio.click()
    addLog(state, `ได้เริ่ม ${replaceTrans(action, true)}`)
    delay(() => updateData(state, { roomId }))
  }

  const characterActionClicked = (action) => {
    const state = { log }

    PlayAudio.click()
    addLog(state, `แสดงตัวเป็น ${replaceTrans(action, true)}`)
    delay(() => updateData(state, { roomId }))
  }

  const takeCoinClicked = (player, number) => {
    const state = { players, log }

    state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.coin = _player.coin + number
      }
      return _player
    })
    setPlayers(state.players)

    PlayAudio.coin()
    addLog(state, `หยิบ ${number} เหรียญ`)
    delay(() => updateData(state, { roomId }))
  }

  const pay3CoinClicked = () => {
    const state = { players, log, rule }

    if (me.coin < 3) 
      return false

    state.players = removeCoin(state, 3)
    setPlayers(state.players)
    state.rule.assassinCoin += 3
    setRule({ ...state.rule })

    PlayAudio.sword()
    addLog(state, `จ่าย 3 เหรียญ ลอบสังหาร`)
    delay(() => updateData(state, { roomId }))
  }

  const pay7CoinClicked = () => {
    const state = { players, log }

    if (me.coin < 7) 
      return false

    state.players = removeCoin(state, 7)
    setPlayers(state.players)

    PlayAudio.coup()
    addLog(state, `จ่าย 7 เหรียญ ยึดอำนาจ`)
    delay(() => updateData(state, { roomId }))
  }

  const throw1CoinClicked = () => {
    const state = { players, log }

    state.players = removeCoin(state, 1)
    setPlayers(state.players)

    PlayAudio.open()
    addLog(state, `ทิ้ง 1 เหรียญ`)
    delay(() => updateData(state, { roomId }))
  }

  const steal2CoinClicked = (player) => {
    const state = { players, log }

    const targetPlayer = state.players.find(_player => _player.sessionId === player.sessionId)
    if (targetPlayer.coin < 2)
      return false

    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId && _player.coin >= 2) {
        _player.coin = _player.coin - 2
      }
      if (_player.sessionId === me.sessionId && player.coin >= 2) {
        _player.coin = _player.coin + 2
      }
      return _player
    })
    
    PlayAudio.open()
    addLog(state, `ขโมย 2 เหรียญจาก ${Player.showFullname(player)}`)
    delay(() => updateData(state, { roomId }))
  }

  const drawCardClicked = (number = 1, player) => {
    const state = { log, deck, players }

    const drawCardIds = drawCard(number, player, state)
    if (!drawCardIds)
      return PlayAudio.open()

    PlayAudio.drawCard()

    // save log draw card
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.logDrawCardIds = [..._player.logDrawCardIds, ...drawCardIds]
      }
      return _player
    })
    setPlayers(state.players)

    addLog(state, "จั่วการ์ด")
    delay(() => updateData(state, { roomId }))
  }

  const faceUpCardClicked = (card) => {
    const state = { log, players }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.faceUpCardIds = [..._player.faceUpCardIds, card.id]
        _player.cardIds = _player.cardIds.filter(cardId => cardId !== card.id)
      }
      return _player
    })
    setPlayers(state.players)

    clearEmoji()
    PlayAudio.skillSuccess()
    addLog(state, `<span class="red">หงายการ์ด</span> เขาคือ ${card.showName()}`)
    delay(() => updateData(state, { roomId }))
  }

  const sendCardToDeckClicked = (card) => {
    const state = { log, deck, players }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.cardIds = _player.cardIds.filter(cardId => cardId !== card.id)
        _player.faceUpCardIds = _player.faceUpCardIds.filter(cardId => cardId !== card.id)
      }
      return _player
    })
    setPlayers(state.players)

    state.deck = [...shuffleDeck([...state.deck]), card.id]
    setDeck(state.deck)
    
    PlayAudio.drawCard()

    addLog(state, `คืนการ์ดไปยังกองไพ่`)
    delay(() => updateData(state, { roomId }))
  }

  const sendCardToPlayerClicked = (card, player) => {
    const state = { log, players }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.cardIds = _player.cardIds.filter(cardId => cardId !== card.id)
      }
      if (_player.sessionId === player.sessionId) {
        _player.cardIds = [..._player.cardIds, card.id]
      }
      return _player
    })
    setPlayers(state.players)

    PlayAudio.drawCard()

    addLog(state, `มอบการ์ดให้ ${Player.showFullname(player)}`)
    delay(() => updateData(state, { roomId }))
  }

  const takeAssassinCoinClicked = () => {
    const state = { players, rule, log }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.coin += rule.assassinCoin
      }
      return _player
    })
    setPlayers(state.players)

    state.rule.assassinCoin = 0
    setRule(state.rule)

    PlayAudio.coin()
    addLog(state, `ประท้วง หยิบเหรียญนักฆ่าทั้งหมด`)
    delay(() => updateData(state, { roomId }))
  }

  const emojiClicked = (emoji) => {
    const state = { emojis }

    toggleEmojiLoading(true)
    delay(() => toggleEmojiLoading(false), 10000)

    state.emojis = state.emojis.map(_emoji => {
      if (_emoji.sessionId === me.sessionId) {
        _emoji.emoji = emoji
      }
      return _emoji
    })
    setEmojis([...state.emojis])
    
    delay(() => updateData({ emojis: state.emojis }, { roomId: EMOJI_DOC }))
  }

  const endTurnClicked = () => {
    const state = { players, rule, log }

    const nextPlayer = endTurn(state)
    PlayAudio.click()

    clearEmoji()
    addLog(state, "จบเทิร์น")
    addLog(state, `เทิร์นของ ${Player.showFullname(nextPlayer)}`)
    delay(() => updateData(state, { roomId }))
  }

  const deadClicked = () => {
    const state = { log, players }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.faceUpCardIds = [..._player.faceUpCardIds, 1]
      }
      return _player
    })

    if (isMyTurn)
      endTurn(state)

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.faceUpCardIds = _player.faceUpCardIds.slice(0, 2)
        _player.coin = 0
      }
      return _player
    })
    setPlayers(state.players)

    PlayAudio.dead()
    addLog(state, `<span class='red'>ตายอย่างน่าอดสู</span>`)

    const alivePlayers = state.players.filter(_player => _player.faceUpCardIds.length !== 2 && _player.coin !== 0)
    if (alivePlayers.length === 1) 
      addLog(state, `<span class='green'>${alivePlayers[0].name} ได้รับชัยชนะ</span>`)

    delay(() => updateData(state, { roomId }))
  }

  const onYourNameInputChange = (e) => {
    setYourname(e.target.value)
  }

  const joinGameClicked = () => {
    const state = { rule, log, players, emojis }

    let freeSitZones = [...Array(9).keys()].slice(1).filter((sitZone) => {
      return !state.players.some(_player => _player.sitZone === sitZone)
    })
    freeSitZones = sortRandom(freeSitZones)
    let newPlayer = new Player(yourName, randomIdOnlyNumber(6), freeSitZones[0])
    newPlayer = JSON.parse(JSON.stringify(newPlayer))
    state.players = [...state.players, newPlayer]
    state.players = randomSitZone(state.players)
    setPlayers(state.players)

    queryParams.set("sessionId", newPlayer.sessionId)
    const newUrl = "?" + queryParams.toString()
    window.history.replaceState({ path: newUrl }, '', newUrl)

    const firstPlayerIndex = Math.floor(Math.random() * state.players.length)
    state.rule = { ...state.rule, turnSessionId: state.players[firstPlayerIndex].sessionId}
    setRule(state.rule)

    state.emojis = state.players.map(_player => ({
      name: _player.name,
      sessionId: _player.sessionId,
      emoji: null
    }))
    setEmojis([...state.emojis])

    PlayAudio.open()

    addLog(state, `${Player.showFullname(newPlayer)} ผู้เล่นเข้าร่วมเกมส์`)
    delay(() => updateData(state, { roomId }))
    delay(() => updateData({ emojis: state.emojis }, { roomId: EMOJI_DOC }))
  }

  const renderLog = (_log) => {
    if (!_log) return null

    let actor = players.find(_player => _player.sessionId === _log.sessionId)
    actor = actor ? `<span class="bold">${Player.showFullname(actor)}</span>:` : ""
    const message = `${actor} ${_log.msg}`

    return <div dangerouslySetInnerHTML={{ __html: `<div>- ${message}</div>` }}></div>
  }

  const renderPlayerComponent = (zone) => {
    return <PlayerComponent players={players} rule={rule} zone={zone} me={me} lastLog={lastLog} emojis={emojis}
      pay3CoinClicked={pay3CoinClicked} pay7CoinClicked={pay7CoinClicked} throw1CoinClicked={throw1CoinClicked} steal2CoinClicked={steal2CoinClicked}
      faceUpCardClicked={faceUpCardClicked} sendCardToDeckClicked={sendCardToDeckClicked} sendCardToPlayerClicked={sendCardToPlayerClicked}
     />
  }

  // emoji not clear when end turn

  return (
    <div className="App">
     <div className='body'>

      <button ref={modalTrigger} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#endgameModal" ></button>

      {/* ENDGAME MODAL */}
      <div class="modal" id="endgameModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="modal-body">
              <div class="endgame-title" dangerouslySetInnerHTML={{ __html: endgameText }} ></div><hr />
              <div>
                <EndgameStats players={players} />
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <div class="row row-cols-3">
        {/* LEFE COLUMN */}
        <div class="col-2 left-col">
          <div class="log-wrapper">
            {log.slice(Math.max(log.length - 20, 0)).map(renderLog)}
          </div>

          <div>card in deck : {deck?.length}</div> <br />

          {isAdmin && (
            <Fragment>
              <DebugTool setRule={setRule} mainState={mainState} drawCardClicked={drawCardClicked} me={me} />
            </Fragment>
          )}
        </div>

        {/* CENTER COLUMN */}
        <div class="col-6">
          <div class="row row-cols-1">
            <div class="col zone">
              <div className="announcer-block">
                <h1>เทิร์นของ {turnPlayer?.name} </h1>
                <h5>
                  {renderLog(lastLog)}
                </h5>
              </div>

              <div class="row row-cols-3">
                <div class="col zone1 player-zone">{renderPlayerComponent(1)}</div>
                <div class="col zone2 player-zone">{renderPlayerComponent(2)}</div>
                <div class="col zone3 player-zone">{renderPlayerComponent(3)}</div>
                <div class="col zone4 player-zone">{renderPlayerComponent(8)}</div>
                <div class="col zone5 battle-zone">
                  <div>
                    <div class="btn-group" role="group">
                      <img class="action-card back-of-card dropdown-toggle" src='img/card_back_of_card.png' data-bs-toggle="dropdown" aria-expanded="false" />
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onClick={() => drawCardClicked(1, me)}>จั่วการ์ด</a></li>
                      </ul>
                    </div>

                    <div class="btn-group" role="group">
                      <img class="multi-coin dropdown-toggle" src='img/multi_coin.png' data-bs-toggle="dropdown" aria-expanded="false" />
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onClick={() => takeCoinClicked(me, 1)}>
                          <strong>ทำงาน</strong> <span class="green">หยิบ</span> 1 เหรียญ</a></li>
                        <li><a class="dropdown-item" href="#" onClick={() => takeCoinClicked(me, 2)}>
                          <strong>รับบริจาค</strong> <span class="green">หยิบ</span> 2 เหรียญ</a></li>
                        <li><a class="dropdown-item" href="#" onClick={() => takeCoinClicked(me, 3)}>
                          <strong>เก็บภาษี</strong> <span class="green">หยิบ</span> 3 เหรียญ</a></li>
                      </ul>
                    </div>
                  </div>

                  {createArray(rule?.assassinCoin).map(() => {
                    return (
                      <div class="btn-group" role="group">
                        <img id="btnSkill" class="coin dropdown-toggle blink_me_sec" src="img/red_coin.png" data-bs-toggle="dropdown" aria-expanded="false"/>
                        <ul class="dropdown-menu" aria-labelledby="btnSkill">
                          <li><a class="dropdown-item" href="#" onClick={takeAssassinCoinClicked}><strong>ประท้วง</strong> หยิบเหรียญนักฆ่าทิ้งหมด</a></li>
                        </ul>
                      </div>
                    )
                  })}
                </div>
                <div class="col zone6 player-zone">{renderPlayerComponent(4)}</div>
                <div class="col zone7 player-zone">{renderPlayerComponent(7)}</div>
                <div class="col zone8 player-zone">{renderPlayerComponent(6)}</div>
                <div class="col zone9 player-zone">{renderPlayerComponent(5)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div class="col-4 right-col">
                  

          {notLoggedIn && (
            <Fragment>
              <div>
              <input type="text" class="form-control your-name-input blink_me_few_sec" placeholder='YOUR NAME...'
                value={yourName}
                onChange={onYourNameInputChange}
              />
              <button type="button" class="btn btn-primary join-game-btn btn-md" onClick={joinGameClicked}>
                เข้าร่วมเกมส์
              </button>
              </div>
            </Fragment>
          )}

          {!notLoggedIn && 
            <table className="table action-table">
              <thead>
                <tr>
                  <th>Character</th>
                  <th>Action</th>
                  <th>Action Effect</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                <tr onClick={() => actionClicked("work")}>
                  <td>-</td>
                  <td>ทำงาน</td>
                  <td>หยิบ 1 เหรียญ</td>
                  <td>-</td>
                </tr>
                <tr onClick={() => actionClicked("donate")}>
                  <td>-</td>
                  <td>รับบริจาค</td>
                  <td>หยิบ 2 เหรียญ</td>
                  <td>-</td>
                </tr>
                <tr onClick={() => actionClicked("coup")}>
                  <td>-</td>
                  <td>ยึดอำนาจ</td>
                  <td>จ่าย 7 เหรียญ <br />ประหารผู้เล่น 1 คน</td>
                  <td>-</td>
                </tr>
                <tr onClick={() => characterActionClicked("duke")}>
                  <td><span className="pink">Duke</span></td>
                  <td>เก็บภาษี</td>
                  <td>หยิบ 3 เหรียญ</td>
                  <td>X รับบริจาค</td>
                </tr>
                <tr onClick={() => characterActionClicked("assassin")}>
                  <td><span className="grey">Assassin</span></td>
                  <td>ลอบสังหาร</td>
                  <td>จ่าย 3 เหรียญ<br />โจมตีผู้เล่น 1 คน</td>
                  <td>-</td>
                </tr>
                <tr onClick={() => characterActionClicked("ambassador")}>
                  <td><span className="green">Ambassador</span></td>
                  <td>แลกเปลี่ยน</td>
                  <td>จั่วการ์ด 2 ใบ และคืนการ์ด 2 ใบ</td>
                  <td>X ขโมย</td>
                </tr>
                <tr onClick={() => characterActionClicked("captain")}>
                  <td><span className="blue">Captain</span></td>
                  <td>ขโมย</td>
                  <td>ขโมย 2 เหรียญ จากผู้เล่นอื่น</td>
                  <td>X ขโมย</td>
                </tr>
                <tr onClick={() => characterActionClicked("contessa")}>
                  <td><span className="red">Contessa</span></td>
                  <td>-</td>
                  <td>-</td>
                  <td>X ลอบสังหาร <br />X สอดแนม</td>
                </tr>
                <tr onClick={() => characterActionClicked("inquisitor")}>
                  <td><span className="orange">Inquisitor</span></td>
                  <td>สอดแนม</td>
                  <td>ส่องการ์ด 1 ใบของผู้เล่นอื่น หลังจากนั้น <br /> คืนการ์ด, ทิ้งแล้วจั่วใหม่, สลับการ์ดกับคุณ</td>
                  <td>X ขโมย </td>
                </tr>
                <tr onClick={() => actionClicked("protest")}>
                  <td>-</td>
                  <td>ประท้วง</td>
                  <td>ประกาศว่าไม่มี <span className="pink bold">Duke</span> บนมือ <br /> หยิบเหรียญนักฆ่าทั้งหมด</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          }
          
          {!notLoggedIn && (
            <div className="d-flex action-block">
              <div>
                <button onClick={() => emojiClicked("challenge")} type="button" class="btn btn-success btn-md btn-action">ท้าทาย</button>
                <button type="button" class={classNames("btn btn-md btn-action tooltip1", { "btn-primary": !isEmojiLoading, "btn-secondary": isEmojiLoading })}>
                  {!isEmojiLoading && (
                    <span class="tooltiptext">
                      {defaultEmojis.map(emoji => <img class="select-emoji" src={`img/emoji_${emoji}.png`} alt={emoji} onClick={() => emojiClicked(emoji)} />)}
                    </span>
                  )}
                  อีโมจิ
                </button>

                {isDying && <button onClick={deadClicked} type="button" class="btn btn-danger btn-md btn-action blink_me">ตาย</button>}               
                {isMyTurn && <button onClick={endTurnClicked} type="button" class="btn btn-secondary btn-md btn-action">จบเทิร์น</button>} 
              </div>
              <div>
                <img className="action-card action-card-md" src="img/card_duke.png" alt="duke" onClick={() => characterActionClicked("duke")} />
                <img className="action-card action-card-md" src="img/card_assassin.png" alt="assassin" onClick={() => characterActionClicked("assassin")} />
                <img className="action-card action-card-md" src="img/card_ambassador.png" alt="ambassador" onClick={() => characterActionClicked("ambassador")} />
                <img className="action-card action-card-md" src="img/card_captain.png" alt="captain" onClick={() => characterActionClicked("captain")} />
                <img className="action-card action-card-md" src="img/card_contessa.png" alt="contessa" onClick={() => characterActionClicked("contessa")} />
                <img className="action-card action-card-md" src="img/card_inquisitor.png" alt="inquisitor" onClick={() => characterActionClicked("inquisitor")} />
              </div>
            </div>
          )}
        </div>

      </div>

     </div>
    </div>
  );
}

export default App;
