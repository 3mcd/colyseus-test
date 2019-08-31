import { type } from "@colyseus/schema";
import { Entity, EntityOptions } from "./Entity";

export type BodyOptions = EntityOptions & {
  x: number;
  y: number;
  angle?: number;
  angularVelocity?: number;
  mass?: number;
  width?: number;
  height?: number;
  velocityX?: number;
  velocityY?: number;
  fixedRotation?: boolean;
};

export class Body extends Entity {
  @type("float32")
  x: number;
  @type("float32")
  y: number;
  @type("float32")
  angle = 0;
  @type("float32")
  mass = 0;
  @type("float32")
  width = 1;
  @type("float32")
  height = 1;

  createdTime = Date.now();

  angularVelocity = 0;
  velocityX = 0;
  velocityY = 0;
  angularDamping = 0;
  damping = 0;
  fixedRotation = false;
  collisionGroup: number = 1;
  collisionMask: number = 1;

  constructor(options: BodyOptions) {
    super(options);

    Object.assign(this, options);
  }
}
