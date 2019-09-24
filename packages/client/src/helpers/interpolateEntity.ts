import { Body } from "@warbird/core";
import { Math, Object3D } from "three";

export function interpolateEntity(body: Body, object: Object3D) {
  object.position.set(
    Math.lerp(object.position.x, body.x, 0.6),
    Math.lerp(object.position.y, body.y, 0.6),
    0,
  );
  object.rotation.set(0, 0, Math.lerp(object.rotation.z, body.angle, 0.9));
}
