import { MiniActionTitleScene } from "../../../src/runtime/scenes/MiniActionTitleScene"
import { generatedGameDefinition } from "./gameDefinition"

export class TitleScene extends MiniActionTitleScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
