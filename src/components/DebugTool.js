import { delay } from "../classes/Utils"
import { updateData, resetInit, addInit, EMOJI_DOC } from "../classes/ApiService"
import { } from "../classes/DataInit"
import Player from '../classes/Player'

const DebugTool = (props) => {
  const { setRule, mainState, drawCardClicked, test, me } = props
  const players = mainState.players

  const queryParams = new URLSearchParams(window.location.search)
  const sessionId = queryParams.get("sessionId")
  const roomId = queryParams.get("roomId")

  const setTurn = (player) => {
    const state = { rule: mainState.rule }
    state.rule.turnSessionId = player.sessionId

    setRule({ ...state.rule })
    delay(() => updateData({ rule: state.rule }, { roomId }))
  }

  const controlPlayer = (player) => {
    if (!player)
      queryParams.delete("sessionId")
    else 
      queryParams.set("sessionId", player.sessionId)
    
    const newUrl = "?" + queryParams.toString()
    window.history.replaceState({ path: newUrl }, '', newUrl)
    setRule({ ...mainState.rule })
  }

  const doRestartMatch = () => {
    const state = { rule: mainState.rule }
    state.rule = { ...state.rule, restartMatch: true }
    updateData({ rule: state.rule }, mainState, { roomId })
    delay(() => resetInit(roomId, sessionId))
    delay(() => resetInit(EMOJI_DOC, sessionId))
  }

  return (
    <div className="d-grid gap-2 dev-tool-wrapper">
      <div class="btn-group" role="group">
        <button id="btnDev4" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          ADMIN {test}
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev4">
          <li><a class="dropdown-item" href="#" onClick={doRestartMatch}>RESET DATA {roomId}</a></li>
          <li><a class="dropdown-item" href="#" onClick={addInit}>ADD DATA</a></li>
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev2" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          SET TURN
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev2">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => setTurn(player)}>{Player.showFullname(player)}</a></li>
          ))}
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev3" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          CONTROL PLAYER
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev3">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => controlPlayer(player)}>{Player.showFullname(player)}</a></li>
          ))}
           <li><a class="dropdown-item" href="#" onClick={() => controlPlayer(null)}>FREE CONTROL</a></li>
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev1" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          GIVE CARD 2
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev1">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => drawCardClicked(2, player)}>{Player.showFullname(player)}</a></li>
          ))}
        </ul>
      </div>
{/* 
      <button onClick={() => drawButtonClicked(10, me)} type="button" class="btn btn-secondary btn-sm btn-block">
        DRAW 10
      </button> */}

      <hr />
    </div>
  )
}

export default DebugTool