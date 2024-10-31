import { mapMasterDeck } from "../classes/Card"
import Player from "../classes/Player"

export default function EndgameStats({ players }) {
  return players.map(player => {
    return (
      <div className="player player-endgame">
        <div className={`player-wrapper`}>
          <div class="avatar">
            <i class="fa fa-user"></i>
          </div>
          <div class="player-detail">
            <div class={"player-name"}>{Player.showFullname(player)}</div>
          </div>
        </div>
        <div>
          {player.logDrawCardIds.map(mapMasterDeck).map(card => 
            <img className="action-card" src={`img/card_${card.name}.png`} alt={card.name} data-bs-toggle="dropdown" aria-expanded="false" />   
          )}
        </div>
      </div>
    )
  })
}