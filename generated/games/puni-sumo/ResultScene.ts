import { MiniActionResultScene } from "../../../src/runtime/scenes/MiniActionResultScene"
import { generatedGameDefinition } from "./gameDefinition"

export class ResultScene extends MiniActionResultScene {
  constructor() {
    super(generatedGameDefinition)
  }
}
