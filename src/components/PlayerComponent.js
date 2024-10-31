import classNames from "classnames"
import Player from '../classes/Player'
import { createArray, stringContains } from "../classes/Utils"
import { Fragment } from "react"
import { mapMasterDeck, replaceTrans } from "../classes/Card"

export default function PlayerComponent(props) {
  const { players, rule, zone, me, lastLog, emojis, pay3CoinClicked, pay7CoinClicked, throw1CoinClicked, steal2CoinClicked,
    faceUpCardClicked, sendCardToDeckClicked, sendCardToPlayerClicked } = props
    
  const player = players.find(_player => _player.sitZone === zone)
  const isTheirTurn = player && player?.sessionId === rule?.turnSessionId

  if (!player)
    return null

  const emoji = emojis.find(_emoji => _emoji.sessionId === player.sessionId)
  const isMe = player.sessionId === me?.sessionId
  const isDead = player.coin === 0 && player.faceUpCardIds.length === 2

  const bubbleText = () => {
    if (!lastLog) return null

    const msg = replaceTrans(lastLog.msg)
    const backOfCardRedCross = `<img class="red-cross" src="img/red_cross.png" alt="red-cross" /><span class="bubble-text">
      <img class="action-card action-card-sm" src="img/card_back_of_card.png"} alt="card_back_of_card" />
    </span>`
    const backOfCard =  `<img class="action-card action-card-sm" src="img/card_back_of_card.png"} alt="card_back_of_card" />`
    const loseCoin =  `<span class="take-coin red">-<img class="coin" src="img/coin.png"} alt="coin" /></span>`

    if (lastLog?.sessionId === player.sessionId) {
      if (msg.includes("จั่วการ์ด")) {
        return backOfCard
      }

      if (msg.includes("หงายการ์ด")) {
        const index = msg.indexOf("หงายการ์ด")
        let charName = msg.substr(index + 24).trim()
        charName = replaceTrans(charName)
        
        return `<img class="action-card action-card-sm" src="img/card_${charName}.png"} alt="${charName}" />`
      }

      if (msg.includes("แสดงตัวเป็น")) {
        const index = msg.indexOf("แสดงตัวเป็น ")
        let charName = msg.substr(index + 11).trim()
        charName = replaceTrans(charName)
        return `<img class="action-card action-card-sm" src="img/card_${charName}.png"} alt="${charName}" />`
      }

      if (stringContains(["หยิบ 1 เหรียญ", "หยิบ 2 เหรียญ", "หยิบ 3 เหรียญ", "ขโมย 2 เหรียญ"], msg)) {
        return `<span class="take-coin green">+<img class="coin" src="img/coin.png"} alt="coin" /></span>`
      }

      if (stringContains(["ทิ้ง 1 เหรียญ", "จ่าย 3 เหรียญ", "จ่าย 7 เหรียญ"], msg)) {
        return loseCoin
      }

      if (msg.includes("หยิบเหรียญนักฆ่าทั้งหมด")) {
        return `<span class="take-coin green">+<img class="coin" src="img/red_coin.png"} alt="red_coin" /></span>`
      }

      if (msg.includes("คืนการ์ดไปยังกองไพ่")) {
        return backOfCardRedCross
      }

      if (msg.includes("มอบการ์ดให้") && lastLog.sessionId === player.sessionId) {
        return backOfCardRedCross
      } 
      
      if (msg.includes("ได้เริ่ม ")) {
        const index = msg.indexOf("ได้เริ่ม ")
        let actionName = msg.substr(index + 9).trim()
        return `<img class="action-card-icon" src="img/use_${actionName}.png"} alt="${actionName}" />`
      }
    }
    else {
      if (msg.includes("มอบการ์ดให้") && msg.includes(Player.showFullname(player))) {
        return backOfCard
      }

      if (msg.includes("ขโมย 2 เหรียญ") && msg.includes(Player.showFullname(player))) {
        return loseCoin
      }
    }

    if (emoji?.emoji) {
      return `<img class="action-card-icon" src="img/emoji_${emoji.emoji}.png"} alt="use_${emoji.emoji}" />`
    }
  }

  return (
    <div className={classNames(`player`, { "is-me": isMe })}>
      {bubbleText() && (
        <div className="bubble bubble-right" dangerouslySetInnerHTML={{ __html: bubbleText() }}></div>
      )}
      <div className={classNames(`player-wrapper`)}>
        <div class="avatar">
          {isDead 
            ? <img class="avatar-img" src="img/dead_icon.png" alt="dead" />
            : <i class="fa fa-user"></i>
          }
        </div>
        <div class="player-detail">
          <div class={classNames("player-name", { green: isMe })}>
            {player.name}  {isTheirTurn && <img class="fa-cards blink_me" src="img/cards.png" alt="isTheirTurn" />}
            <br />
            ({player.sessionId})
          </div>
        </div>
      </div>

      <div className="hand-card-zone">
        {player.faceUpCardIds.map(mapMasterDeck).map(card => isMe 
          ? (
            <div class="btn-group" role="group">
              <img className="action-card revealed-card" src={`img/card_${card.name}.png`} alt={card.name} data-bs-toggle="dropdown" aria-expanded="false" />
              <ul class="dropdown-menu">
                <li><a className={"dropdown-item"} href="#" onClick={() => sendCardToDeckClicked(card)}>คืนการ์ดเข้ากองไพ่</a></li>
              </ul>
            </div>
          )
          : <img className="action-card revealed-card" src={`img/card_${card.name}.png`} alt={card.name} /> 
        )}
          
        {player.cardIds.map(mapMasterDeck).map(card => isMe 
          ? (
            <div class="btn-group" role="group">
              <img className="action-card dropdown-toggle" src={`img/card_${card.name}.png`} alt={card.name} data-bs-toggle="dropdown" aria-expanded="false" /> 
              <ul class="dropdown-menu">
                <li><a className={"dropdown-item"} href="#" onClick={() => sendCardToDeckClicked(card)}>คืนการ์ดเข้ากองไพ่</a></li>
                {players.filter(_player => _player.sessionId !== me.sessionId).map(_player => (
                  <li><a className={"dropdown-item"} href="#" onClick={() => sendCardToPlayerClicked(card, _player)}>
                    <span className="red">มอบการ์ดให้</span> {_player.name} </a></li>
                ))}
                 <li><a className={"dropdown-item"} href="#" onClick={() => faceUpCardClicked(card)}><span class="red">หงายการ์ด</span></a></li>
              </ul>
            </div>
          )
          : <img className="action-card" src={`img/card_back_of_card.png`} alt={"back-of-card"} />
        )}
      </div>

      <div className="coin-zone tooltip2" >
        {createArray(player.coin).map(() => {
          return (
            <div class="btn-group" role="group">
              <img id="btnCoin" class="coin dropdown-toggle blink_me_sec" src="img/coin.png" data-bs-toggle="dropdown" aria-expanded="false"/>
              <ul class="dropdown-menu" aria-labelledby="btnCoin">
                {isMe ? (
                  <Fragment>
                    <li><a className={classNames("dropdown-item", { grey: player.coin < 3 })} href="#" onClick={pay3CoinClicked}>
                      <strong>ลอบสังหาร</strong> <span class="red">จ่าย</span> 3 เหรียญ</a></li>
                    <li><a className={classNames("dropdown-item", { grey: player.coin < 7 })} href="#" onClick={pay7CoinClicked}>
                      <strong>ยึดอำนาจ</strong> <span class="red">จ่าย</span> 7 เหรียญ</a></li>
                    <li><a className={classNames("dropdown-item", { grey: player.coin < 1 })} href="#" onClick={throw1CoinClicked}>
                      <span class="red">ทิ้ง</span> 1 เหรียญ</a></li>
                  </Fragment>
                ) : <li><a className={classNames("dropdown-item", { grey: player.coin < 2 })} href="#" onClick={() => steal2CoinClicked(player)}>
                      <strong>ขโมย</strong> 2 เหรียญ</a></li>}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
