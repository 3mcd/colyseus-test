import { ArraySchema, type } from "@colyseus/schema";
import { CollisionGroup } from "../model/Body";
import { Entity } from "../model/Entity";
import { Ship } from "../model/Ship";
import { EntitySchema } from "./EntitySchema";
import { WeaponSchema } from "./WeaponSchema";

const shipType = "ship";

export class ShipSchema extends EntitySchema implements Ship {
  type = shipType;

  @type("uint16")
  energy = 100;

  @type([WeaponSchema])
  weapons = new ArraySchema<WeaponSchema>(new WeaponSchema());

  getBodyOptions() {
    return {
      mass: 2,
      width: 1,
      height: 2,
      angularDamping: 0.5,
      damping: 0.3,
      collisionGroup: CollisionGroup.Vehicle,
      collisionMask:
        CollisionGroup.Vehicle |
        CollisionGroup.Projectile |
        CollisionGroup.Static,
    };
  }
}

export const isShip = (entity: Entity): entity is ShipSchema =>
  entity.type === shipType;
