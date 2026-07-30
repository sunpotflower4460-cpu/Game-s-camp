import { MiniActionGameScene } from "{{import.scenes}}/MiniActionGameScene"
import { generatedGameDefinition } from "./gameDefinition"

export class {{scene.game}} extends MiniActionGameScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
