import { forwardRef, useImperativeHandle, useRef } from "react";
import { HERO_SCENE } from "./heroScene.config.js";
import { SheerWindowModule } from "./SheerWindowModule.jsx";

const layerStyle = ({ left, top, width, height }) => ({
  left: `${left * 100}%`,
  top: `${top * 100}%`,
  width: `${width * 100}%`,
  height: `${height * 100}%`,
});

export const SheerEleganceScene = forwardRef(function SheerEleganceScene(_, ref) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const roomDimRef = useRef(null);
  const lampCoreRef = useRef(null);
  const lampHaloRef = useRef(null);
  const windowRefs = useRef([]);
  const objectRefs = useRef({});

  useImperativeHandle(ref, () => ({
    root: rootRef.current,
    canvas: canvasRef.current,
    roomDim: roomDimRef.current,
    lampCore: lampCoreRef.current,
    lampHalo: lampHaloRef.current,
    objects: objectRefs.current,
    windows: windowRefs.current.map((item) => item).filter(Boolean),
  }));

  return (
    <div ref={rootRef} className="sheer-scene" aria-hidden="true">
      <div
        ref={canvasRef}
        className="sheer-scene-canvas"
        style={{
          "--lamp-x": `${HERO_SCENE.lamp.x * 100}%`,
          "--lamp-y": `${HERO_SCENE.lamp.y * 100}%`,
          "--lamp-core-x": `${HERO_SCENE.lamp.coreRadiusX * 100}%`,
          "--lamp-core-y": `${HERO_SCENE.lamp.coreRadiusY * 100}%`,
          "--lamp-halo-x": `${HERO_SCENE.lamp.haloRadiusX * 100}%`,
          "--lamp-halo-y": `${HERO_SCENE.lamp.haloRadiusY * 100}%`,
        }}
      >
        <img
          className="room-base-layer"
          src={HERO_SCENE.assets.roomBase}
          alt=""
          width={HERO_SCENE.canvas.width}
          height={HERO_SCENE.canvas.height}
          decoding="async"
          fetchPriority="high"
        />

        <div className="window-masks-layer">
          {HERO_SCENE.windows.map((windowConfig, index) => (
            <SheerWindowModule
              key={windowConfig.id}
              windowConfig={windowConfig}
              ref={(element) => { windowRefs.current[index] = element; }}
            />
          ))}
        </div>

        <img
          ref={(element) => { objectRefs.current.plant = element; }}
          className="scene-object-layer plant-layer"
          src={HERO_SCENE.assets.plant}
          alt=""
          style={layerStyle(HERO_SCENE.foreground.plant)}
          decoding="async"
        />
        <img
          ref={(element) => { objectRefs.current.sideTable = element; }}
          className="scene-object-layer side-table-layer"
          src={HERO_SCENE.assets.sideTable}
          alt=""
          style={layerStyle(HERO_SCENE.foreground.sideTable)}
          decoding="async"
        />
        <img
          ref={(element) => { objectRefs.current.lamp = element; }}
          className="scene-object-layer lamp-layer"
          src={HERO_SCENE.assets.lamp}
          alt=""
          style={layerStyle(HERO_SCENE.foreground.lamp)}
          decoding="async"
        />
        <img
          ref={(element) => { objectRefs.current.furnitureGroup = element; }}
          className="scene-object-layer furniture-group-layer"
          src={HERO_SCENE.assets.furnitureGroup}
          alt=""
          style={layerStyle(HERO_SCENE.foreground.furnitureGroup)}
          decoding="async"
        />

        <div ref={roomDimRef} className="room-dim-overlay" />
        <div ref={lampHaloRef} className="lamp-halo-layer" />
        <img
          ref={lampCoreRef}
          className="lamp-on-layer"
          src={HERO_SCENE.assets.lampOn}
          alt=""
          style={layerStyle(HERO_SCENE.foreground.lamp)}
          decoding="async"
        />
      </div>
    </div>
  );
});
