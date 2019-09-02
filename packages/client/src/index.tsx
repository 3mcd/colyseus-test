import {
  Body,
  command,
  Entity,
  isBall,
  isBullet,
  isShip,
  isTile,
  placeTile,
  GameState,
} from "colyseus-test-core";
import { Client, Room } from "colyseus.js";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { Canvas, CanvasContext, useRender, useThree } from "react-three-fiber";
import { Math, PCFSoftShadowMap } from "three";
import { useClick } from "./hooks/useClick";
import { createInputListener } from "./input";
import { Ball } from "./objects/Ball";
import { Bullet } from "./objects/Bullet";
import { Ship } from "./objects/Ship";
import { Tile } from "./objects/Tile";

const input = createInputListener({
  KeyW: "thrustForward",
  KeyA: "turnLeft",
  KeyS: "thrustReverse",
  KeyD: "turnRight",
  Space: "fire",
  ShiftLeft: "afterburners",
});

async function preload() {
  // @ts-ignore
  const myFont = new FontFace(
    "PragmataPro Mono Liga",
    "url(./assets/fonts/PragmataProMonoLiga.woff2)",
  );
  // @ts-ignore
  const font = await myFont.load();
  // @ts-ignore
  document.fonts.add(font);
}

function Loader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: "#030303",
      }}
    >
      <h2
        style={{
          position: "absolute",
          top: "50%",
          translate: `transformY(-50%)`,
          color: "#fff",
          textAlign: "center",
          width: "100%",
          fontSize: 16,
          textTransform: "lowercase",
          fontVariant: "small-caps",
          fontFamily: '"PragmataPro Mono Liga", monospace',
        }}
      >
        Loading...
      </h2>
    </div>
  );
}

function waitMs(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function connect<S>(
  client: Client,
  roomName: string,
  pollInterval: number = 1000,
) {
  let room: Room<S> | undefined;

  const previousRoomId = localStorage.getItem("roomId");
  const previousSessionId = localStorage.getItem("sessionId");

  while (!room) {
    try {
      if (previousRoomId && previousSessionId) {
        room = await client.reconnect(previousRoomId, previousSessionId);
      } else {
        room = await client.joinOrCreate(roomName);
      }
    } catch (e) {
      localStorage.removeItem("roomId");
      localStorage.removeItem("sessionId");
      await waitMs(pollInterval);
    }
  }

  localStorage.setItem("roomId", room.id);
  localStorage.setItem("sessionId", room.sessionId);

  return room as Room<S>;
}

async function main() {
  const client = new Client(
    `ws://${(window as any).APP_CONFIGURATION.SERVER_HOST.replace(
      "localhost",
      window.location.hostname,
    )}`,
  );

  ReactDOM.render(<Loader />, document.getElementById("root"));

  const [room] = await Promise.all([
    connect<GameState>(
      client,
      "main",
    ),
    preload(),
  ]);

  input.subscribe((key, value) => room.send(command(key, value)));

  ReactDOM.render(
    <Canvas
      onCreated={onCanvasCreated}
      camera={defaultCameraOptions}
      pixelRatio={window.devicePixelRatio}
      style={{ backgroundColor: "#030303" }}
    >
      <Main room={room} client={client} />
    </Canvas>,
    document.getElementById("root"),
  );
}

function Main(props: { room: Room; client: Client }) {
  const { client, room } = props;
  const [entities, setEntities] = useState<Entity[]>();
  const [bodies, setBodies] = useState<{ [bodyId: string]: Body }>();
  const [playerBody, setPlayerBody] = useState<Body>();
  const { camera } = useThree();
  const onClick = useCallback((x, y) => room.send(placeTile(x, y)), [room]);

  useClick(camera, onClick);

  useEffect(() => {
    const listener = (state: GameState) => {
      const entities = Object.values(state.entities);
      const playerBody = state.players[room.sessionId];

      if (playerBody.shipId) {
        const ship = state.entities[playerBody.shipId];

        if (ship.bodyId) {
          const body = state.bodies[ship.bodyId];

          setPlayerBody(body);
        }
      }

      setEntities(entities);
      setBodies(state.bodies);
    };

    room.onStateChange(listener);

    return () => room.onStateChange.remove(listener);
  }, [client, room]);

  useRender(
    () => {
      if (!playerBody) {
        return;
      }

      camera.position.set(
        Math.lerp(camera.position.x, playerBody.x, 0.6),
        Math.lerp(camera.position.y, playerBody.y, 0.6),
        50,
      );
    },
    false,
    [playerBody, entities],
  );

  const objects = useMemo(
    () =>
      entities &&
      entities.reduce(
        (acc, entity) => {
          const { id, bodyId } = entity;

          if (!bodyId || !bodies) {
            return acc;
          }

          const body = bodies[bodyId];

          if (!body) {
            return acc;
          }

          if (isShip(entity)) {
            acc.push(
              <Ship
                key={id}
                body={body}
                ship={entity}
                showLabel={body !== playerBody}
              />,
            );
          }

          if (isBall(entity)) {
            acc.push(<Ball key={id} body={body} ball={entity} />);
          }

          if (isTile(entity)) {
            acc.push(<Tile key={id} body={body} tile={entity} />);
          }

          if (isBullet(entity)) {
            acc.push(<Bullet key={id} body={body} bullet={entity} />);
          }

          return acc;
        },
        [] as JSX.Element[],
      ),
    [playerBody, entities, bodies],
  );

  return (
    <Suspense fallback={null}>
      <directionalLight
        intensity={0.5}
        position={[-50, -175, 100]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight intensity={0.2} />
      {objects}
    </Suspense>
  );
}

const defaultCameraOptions = {
  fov: 45,
};

const onCanvasCreated = ({ gl }: CanvasContext) => {
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = PCFSoftShadowMap;
};

main();
