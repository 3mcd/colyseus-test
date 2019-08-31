import { Body } from "colyseus-test-core";
import React, { useMemo } from "react";
import { useSmoothPosition } from "../hooks/useSmoothPosition";

export function Bullet(props: { entity: Body }) {
  const { width } = props.entity;
  const args = useMemo(() => [width / 2, 5], [width]) as [number, number];
  const objectProps = useSmoothPosition(props.entity);

  return (
    <mesh {...objectProps}>
      <circleGeometry attach="geometry" args={args} />
      <meshBasicMaterial attach="material" />
    </mesh>
  );
}
