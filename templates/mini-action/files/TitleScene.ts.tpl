import { MiniActionTitleScene } from "{{import.scenes}}/MiniActionTitleScene"
import { generatedGameDefinition } from "./gameDefinition"

export class {{scene.title}} extends MiniActionTitleScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
