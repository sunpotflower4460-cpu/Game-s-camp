import { MiniActionResultScene } from "{{import.scenes}}/MiniActionResultScene"
import { generatedGameDefinition } from "./gameDefinition"

export class {{scene.result}} extends MiniActionResultScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
