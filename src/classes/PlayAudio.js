import DrawCard from '../audio/drawcard.m4a'
import Cursor1 from '../audio/Cursor1.m4a'
import Skill3 from '../audio/Skill3.m4a'
import Open1 from '../audio/Open1.m4a'
import Dead from '../audio/Dead.mp3'
import Gameover from '../audio/Shock1.m4a'
import Victory from '../audio/Victory2.m4a'
import Coin from '../audio/Coin.m4a'
import Move1 from '../audio/Move1.ogg'
import Sword from '../audio/Sword.ogg'
import MarchDrum from '../audio/MarchDrum.mp3'
import BattleCry from '../audio/BattleCry.mp3'

const volume = 0.27

export default class PlayAudio {
  static buildSound = (soundFile) => {
    const sound = new Audio(soundFile);
    const _sound = sound.cloneNode(true)
    _sound.volume = volume
    return _sound
  }

  static drawCard = () => {
    PlayAudio.play(drawCard)
  }

  static click = () => {
    PlayAudio.play(click)
  }

  static open = () => {
    PlayAudio.play(open)
  }

  static dead = () => {
    PlayAudio.play(dead)
  }

  static skillSuccess = () => {
    PlayAudio.play(skillSuccess)
  }

  static gameOver = () => {
    PlayAudio.play(gameOver)
  }

  static victory = () => {
    PlayAudio.play(victory)
  }

  static coin = () => {
    PlayAudio.play(coin)
  }

  static turnStart = () => {
    PlayAudio.play(turnStart)
  }

  static sword = () => {
    PlayAudio.play(sword)
  }

  static coup = () => {
    PlayAudio.play(coup)
  }

  static protest = () => {
    PlayAudio.play(protest)
  }

  static play(soundObj) {
    try {
      soundObj.play().catch(error => console.error('Error playing audio: ', error))
    } catch (error) {
      console.error('Error playing audio: ', error);
    }
  }
}

const drawCard = PlayAudio.buildSound(DrawCard)
const click = PlayAudio.buildSound(Cursor1)
const open = PlayAudio.buildSound(Open1)
const dead = PlayAudio.buildSound(Dead)
const skillSuccess = PlayAudio.buildSound(Skill3)
const gameOver = PlayAudio.buildSound(Gameover)
const victory = PlayAudio.buildSound(Victory)
const coin = PlayAudio.buildSound(Coin)
const turnStart = PlayAudio.buildSound(Move1)
const sword = PlayAudio.buildSound(Sword)
const coup = PlayAudio.buildSound(MarchDrum)
const protest = PlayAudio.buildSound(BattleCry)
