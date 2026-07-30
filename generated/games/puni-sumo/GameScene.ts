import { MiniActionGameScene } from "../../../src/runtime/scenes/MiniActionGameScene"
import { generatedGameDefinition } from "./gameDefinition"

export class GameScene extends MiniActionGameScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
