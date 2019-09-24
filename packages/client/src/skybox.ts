import { Scene, BoxGeometry, MeshBasicMaterial, BackSide, Mesh } from "three";
import { createStarFieldTexture } from "./textures/stars";

export const createSkyBox = () => {
  const scene = new Scene();
  const outerBox = new BoxGeometry(160, 160, 160);
  const innerBox = new BoxGeometry(60, 60, 60);
  const outerMaterial = new MeshBasicMaterial({
    map: createStarFieldTexture(600),
    side: BackSide,
    transparent: true,
    depthWrite: false,
  });
  const innerMaterial = new MeshBasicMaterial({
    map: createStarFieldTexture(1000),
    side: BackSide,
    transparent: true,
    depthWrite: false,
  });
  const outer = new Mesh(outerBox, outerMaterial);
  const inner = new Mesh(innerBox, innerMaterial);

  scene.add(outer);
  scene.add(inner);

  return scene;
};