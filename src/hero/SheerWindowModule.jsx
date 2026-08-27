import { forwardRef, useImperativeHandle, useRef } from "react";
import { HERO_SCENE } from "./heroScene.config.js";

export const SheerWindowModule = forwardRef(function SheerWindowModule({ windowConfig }, ref) {
  const moduleRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const railRef = useRef(null);
  const exposureRef = useRef(null);
  const { frame } = windowConfig;

  useImperativeHandle(ref, () => ({
    module: moduleRef.current,
    back: backRef.current,
    front: frontRef.current,
    rail: railRef.current,
    exposure: exposureRef.current,
  }));

  return (
    <div
      ref={moduleRef}
      className="sheer-window-module"
      data-window={windowConfig.id}
      style={{
        left: `${frame.left * 100}%`,
        top: `${frame.top * 100}%`,
        width: `${frame.width * 100}%`,
        height: `${frame.height * 100}%`,
        clipPath: windowConfig.clipPath,
        "--band-pitch": `${(HERO_SCENE.fabric.bandPitch / HERO_SCENE.canvas.height) * 100}cqh`,
      }}
    >
      <div ref={exposureRef} className="window-exposure-overlay" />
      <div className="sheer-fabric-viewport">
        <div ref={backRef} className="sheer-fabric-stack sheer-back-stack">
          <div className="sheer-fabric sheer-back-layer" />
        </div>
        <div ref={frontRef} className="sheer-fabric-stack sheer-front-stack">
          <div className="sheer-fabric sheer-front-layer" />
        </div>
      </div>
      <div className="sheer-headrail" />
      <div ref={railRef} className="sheer-bottom-rail"><span /></div>
      <small className="window-debug-label">{windowConfig.id}</small>
    </div>
  );
});
