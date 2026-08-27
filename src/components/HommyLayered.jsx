import { useEffect, useMemo, useRef, useState } from "react";
import {
  HOMMY_LAYERS,
  HOMMY_OFFICIAL_SOURCE,
  HOMMY_PIVOTS,
  HOMMY_RIG_AVAILABLE,
} from "./hommyAssets.js";
import { playHommyTapTablet } from "./hommyAnimation.js";
import "./hommy-layered.css";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function preloadRig() {
  return Promise.all(Object.values(HOMMY_LAYERS).map((source) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = source;
  })));
}

function Layer({ source, className = "", layerRef }) {
  return <img ref={layerRef} className={`hommy-rig-layer ${className}`} src={source} alt="" draggable="false" />;
}

export default function HommyLayered({ reaction }) {
  const [rigStatus, setRigStatus] = useState(HOMMY_RIG_AVAILABLE ? "checking" : "fallback");
  const [motionState, setMotionState] = useState("idle");
  const reducedMotion = useReducedMotion();
  const contactHead = useRef(null);
  const gazeHead = useRef(null);
  const upperArm = useRef(null);
  const elbowRotor = useRef(null);
  const forearm = useRef(null);
  const hand = useRef(null);
  const transitionHand = useRef(null);
  const bridgeHand = useRef(null);
  const pointingHand = useRef(null);
  const shoulderRotor = useRef(null);
  const activeMotion = useRef(null);
  const lastSequence = useRef(0);

  const parts = useMemo(() => ({
    get head() { return contactHead.current; },
    get gaze() { return gazeHead.current; },
    get upperArm() { return upperArm.current; },
    get elbowRotor() { return elbowRotor.current; },
    get forearm() { return forearm.current; },
    get hand() { return hand.current; },
    get transitionHand() { return transitionHand.current; },
    get bridgeHand() { return bridgeHand.current; },
    get pointingHand() { return pointingHand.current; },
    get shoulderRotor() { return shoulderRotor.current; },
  }), []);

  useEffect(() => {
    if (!HOMMY_RIG_AVAILABLE) return undefined;
    let cancelled = false;
    preloadRig()
      .then(() => { if (!cancelled) setRigStatus("ready"); })
      .catch(() => { if (!cancelled) setRigStatus("fallback"); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!reaction.sequence || lastSequence.current === reaction.sequence) return undefined;
    lastSequence.current = reaction.sequence;
    if (rigStatus !== "ready") return undefined;

    activeMotion.current?.cancel();
    setMotionState("tapTablet");
    const motion = playHommyTapTablet(parts, reducedMotion);
    activeMotion.current = motion;
    motion.finished.then(() => {
      if (activeMotion.current === motion) {
        activeMotion.current = null;
        setMotionState("idle");
      }
    });

    return () => {
      motion.cancel();
      if (activeMotion.current === motion) {
        activeMotion.current = null;
      }
    };
  }, [parts, reaction.sequence, reducedMotion, rigStatus]);

  useEffect(() => () => {
    activeMotion.current?.cancel();
  }, []);

  return (
    <div
      className="hommy-layered"
      data-hommy-renderer={rigStatus === "ready" ? "layered" : "official-fallback"}
      data-hommy-motion={motionState}
      style={{
        "--hommy-head-pivot": HOMMY_PIVOTS.head,
        "--hommy-shoulder-pivot": HOMMY_PIVOTS.shoulder,
        "--hommy-elbow-pivot": HOMMY_PIVOTS.elbow,
        "--hommy-wrist-pivot": HOMMY_PIVOTS.wrist,
        "--hommy-pointing-wrist-pivot": HOMMY_PIVOTS.pointingWrist,
      }}
    >
      <img
        className="hommy-official-fallback"
        src={HOMMY_OFFICIAL_SOURCE}
        alt=""
        draggable="false"
      />
      {rigStatus === "ready" && (
        <div
          className="hommy-rig-pose"
          aria-hidden="true"
        >
          <Layer source={HOMMY_LAYERS.body} className="hommy-rig-body" />
          <Layer source={HOMMY_LAYERS.torso} className="hommy-rig-torso" />
          <div className="hommy-rig-head" ref={contactHead}>
            <Layer source={HOMMY_LAYERS.head} className="hommy-rig-head-base" />
            <Layer source={HOMMY_LAYERS.headGaze} className="hommy-rig-head-gaze" layerRef={gazeHead} />
            <Layer source={HOMMY_LAYERS.headBlink} className="hommy-rig-head-blink" />
          </div>
          <Layer source={HOMMY_LAYERS.shoulderSocket} className="hommy-rig-shoulder-socket" />
          <div className="hommy-rig-upper-arm" ref={upperArm}>
            <Layer source={HOMMY_LAYERS.upperArm} />
            <Layer
              source={HOMMY_LAYERS.shoulderRotor}
              className="hommy-rig-shoulder-rotor"
              layerRef={shoulderRotor}
            />
            <div className="hommy-rig-elbow-rotor" ref={elbowRotor}>
              <Layer source={HOMMY_LAYERS.elbowRotor} />
            </div>
            <div className="hommy-rig-forearm" ref={forearm}>
              <Layer source={HOMMY_LAYERS.forearm} />
              <div className="hommy-rig-hand" ref={hand}>
                <Layer source={HOMMY_LAYERS.hand} />
              </div>
              <div className="hommy-rig-transition-hand" ref={transitionHand}>
                <Layer source={HOMMY_LAYERS.transitionHand} />
              </div>
              <div className="hommy-rig-bridge-hand" ref={bridgeHand}>
                <Layer source={HOMMY_LAYERS.bridgeHand} />
              </div>
              <div className="hommy-rig-pointing-hand" ref={pointingHand}>
                <Layer source={HOMMY_LAYERS.pointingHand} />
              </div>
            </div>
          </div>
          <Layer source={HOMMY_LAYERS.tabletForeground} className="hommy-rig-tablet" />
        </div>
      )}
    </div>
  );
}
