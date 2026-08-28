import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HOMMY_CRITICAL_LAYERS,
  HOMMY_LAYERS,
  HOMMY_OFFICIAL_SOURCE,
  HOMMY_PIVOTS,
  HOMMY_RIG_AVAILABLE,
} from "./hommyAssets.js";
import { playHommyTapTablet } from "./hommyAnimation.js";
import { createLatestReactionQueue, preloadHommyLayers } from "./hommyRuntime.js";
import { publishMotionDebug } from "../motionDebug.js";
import { listenForMediaQueryChange, REDUCED_MOTION_QUERY } from "../motionSupport.js";
import "./hommy-layered.css";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches
  ));

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReducedMotion(query.matches);
    update();
    return listenForMediaQueryChange(query, update);
  }, []);

  return reducedMotion;
}

function Layer({ source, className = "", layerRef, enabled = true }) {
  if (!enabled) return null;
  return <img ref={layerRef} className={`hommy-rig-layer ${className}`} src={source} alt="" draggable="false" />;
}

export default function HommyLayered({ reaction }) {
  const [rigStatus, setRigStatus] = useState(HOMMY_RIG_AVAILABLE ? "checking" : "fallback");
  const [motionState, setMotionState] = useState("idle");
  const [feedbackMode, setFeedbackMode] = useState("none");
  const [availableLayers, setAvailableLayers] = useState(() => new Set());
  const [preloadMetrics, setPreloadMetrics] = useState({ loaded: 0, failed: 0 });
  const [lastAnimationError, setLastAnimationError] = useState("");
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
  const mountedRef = useRef(false);
  const executeReactionRef = useRef(() => undefined);
  const reactionQueueRef = useRef(null);

  const ensureReactionQueue = useCallback(() => {
    if (!reactionQueueRef.current || reactionQueueRef.current.getSnapshot().disposed) {
      reactionQueueRef.current = createLatestReactionQueue((queuedReaction) => executeReactionRef.current(queuedReaction));
    }
    return reactionQueueRef.current;
  }, []);

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
    const controller = new AbortController();
    preloadHommyLayers({
      layers: HOMMY_LAYERS,
      criticalLayers: HOMMY_CRITICAL_LAYERS,
      signal: controller.signal,
    }).then((result) => {
      if (result.cancelled || controller.signal.aborted) return;
      setAvailableLayers(new Set(result.loaded));
      setPreloadMetrics({ loaded: result.loaded.length, failed: result.failed.length });
      if (result.criticalFailed.length) {
        setLastAnimationError(`Capas críticas: ${result.criticalFailed.map(({ name }) => name).join(", ")}`);
      } else if (result.optionalFailed.length) {
        setLastAnimationError(`Degradación opcional: ${result.optionalFailed.map(({ name }) => name).join(", ")}`);
      }
      setRigStatus(result.status);
    });
    return () => controller.abort();
  }, []);

  executeReactionRef.current = (queuedReaction) => {
    activeMotion.current?.cancel();
    setMotionState("tapTablet");
    setLastAnimationError((current) => current.startsWith("Capas") || current.startsWith("Degradación") ? current : "");
    const motion = playHommyTapTablet(parts, reducedMotion, (error) => setLastAnimationError(error));
    activeMotion.current = motion;
    setFeedbackMode(motion.mode);
    publishMotionDebug("hommy", {
      reactionSequenceExecuted: queuedReaction.sequence,
      motionState: "tapTablet",
      reducedMotionFallback: reducedMotion,
      lastAnimationError: motion.error ?? "",
    });
    motion.finished.then(() => {
      if (mountedRef.current && activeMotion.current === motion) {
        activeMotion.current = null;
        setMotionState("idle");
        setFeedbackMode("none");
      }
    });
  };

  useEffect(() => {
    ensureReactionQueue().setRendererStatus(rigStatus);
  }, [ensureReactionQueue, rigStatus]);

  useEffect(() => {
    if (!reaction?.sequence) return;
    publishMotionDebug("hommy", { reactionSequenceReceived: reaction.sequence });
    ensureReactionQueue().receive(reaction);
  }, [ensureReactionQueue, reaction]);

  useEffect(() => {
    const snapshot = ensureReactionQueue().getSnapshot();
    publishMotionDebug("hommy", {
      renderer: rigStatus === "ready" ? "layered" : "fallback",
      preloadStatus: rigStatus,
      layersLoaded: preloadMetrics.loaded,
      layersFailed: preloadMetrics.failed,
      reactionSequenceExecuted: snapshot.lastExecutedSequence,
      motionState,
      reducedMotionFallback: reducedMotion,
      lastAnimationError,
    });
  }, [ensureReactionQueue, lastAnimationError, motionState, preloadMetrics, reducedMotion, rigStatus]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const motion = activeMotion.current;
      activeMotion.current = null;
      motion?.cancel();
      reactionQueueRef.current?.dispose();
      reactionQueueRef.current = null;
    };
  }, []);

  const hasLayer = (name) => availableLayers.has(name);

  return (
    <div
      className="hommy-layered"
      data-hommy-renderer={rigStatus === "ready" ? "layered" : "official-fallback"}
      data-hommy-motion={motionState}
      data-hommy-feedback={feedbackMode}
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
          <Layer source={HOMMY_LAYERS.body} className="hommy-rig-body" enabled={hasLayer("body")} />
          <Layer source={HOMMY_LAYERS.torso} className="hommy-rig-torso" enabled={hasLayer("torso")} />
          <div className="hommy-rig-head" ref={contactHead}>
            <Layer source={HOMMY_LAYERS.head} className="hommy-rig-head-base" enabled={hasLayer("head")} />
            <Layer source={HOMMY_LAYERS.headGaze} className="hommy-rig-head-gaze" layerRef={gazeHead} enabled={hasLayer("headGaze")} />
            <Layer source={HOMMY_LAYERS.headBlink} className="hommy-rig-head-blink" enabled={hasLayer("headBlink")} />
          </div>
          <Layer source={HOMMY_LAYERS.shoulderSocket} className="hommy-rig-shoulder-socket" enabled={hasLayer("shoulderSocket")} />
          <div className="hommy-rig-upper-arm" ref={upperArm}>
            <Layer source={HOMMY_LAYERS.upperArm} enabled={hasLayer("upperArm")} />
            <Layer
              source={HOMMY_LAYERS.shoulderRotor}
              className="hommy-rig-shoulder-rotor"
              layerRef={shoulderRotor}
              enabled={hasLayer("shoulderRotor")}
            />
            <div className="hommy-rig-elbow-rotor" ref={elbowRotor}>
              <Layer source={HOMMY_LAYERS.elbowRotor} enabled={hasLayer("elbowRotor")} />
            </div>
            <div className="hommy-rig-forearm" ref={forearm}>
              <Layer source={HOMMY_LAYERS.forearm} enabled={hasLayer("forearm")} />
              <div className="hommy-rig-hand" ref={hand}>
                <Layer source={HOMMY_LAYERS.hand} enabled={hasLayer("hand")} />
              </div>
              <div className="hommy-rig-transition-hand" ref={transitionHand}>
                <Layer source={HOMMY_LAYERS.transitionHand} enabled={hasLayer("transitionHand")} />
              </div>
              <div className="hommy-rig-bridge-hand" ref={bridgeHand}>
                <Layer source={HOMMY_LAYERS.bridgeHand} enabled={hasLayer("bridgeHand")} />
              </div>
              <div className="hommy-rig-pointing-hand" ref={pointingHand}>
                <Layer source={HOMMY_LAYERS.pointingHand} enabled={hasLayer("pointingHand")} />
              </div>
            </div>
          </div>
          <Layer source={HOMMY_LAYERS.tabletForeground} className="hommy-rig-tablet" enabled={hasLayer("tabletForeground")} />
        </div>
      )}
    </div>
  );
}
