import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_SCENE, clamp01, getStageIndex } from "./heroScene.config.js";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const PROGRESS_EVENT = "homeeasy:hero-progress";
const SET_PROGRESS_EVENT = "homeeasy:hero-set-progress";

function getScrollDistance() {
  const { desktopVh, tabletVh, mobileVh } = HERO_SCENE.scroll;
  const multiplier = window.innerWidth <= 760
    ? mobileVh
    : window.innerWidth <= 1050
      ? tabletVh
      : desktopVh;
  return window.innerHeight * multiplier;
}

export function useSheerScrollTimeline({ sectionRef, pinRef, sceneRef, hommyEyeGlowRef, onStageChange }) {
  const timelineRef = useRef(null);
  const triggerRef = useRef(null);
  const stageRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useLayoutEffect(() => {
    if (!sectionRef.current || !pinRef.current || !sceneRef.current) return undefined;

    const scene = sceneRef.current;
    const hommyEyeGlow = hommyEyeGlowRef?.current;
    const eyeGlowTarget = hommyEyeGlow ?? { opacity: 0 };
    const windows = scene.windows;
    if (windows.length !== HERO_SCENE.windows.length) return undefined;

    const backs = windows.map((item) => item.back);
    const fronts = windows.map((item) => item.front);
    const rails = windows.map((item) => item.rail);
    const exposures = windows.map((item) => item.exposure);
    const modules = windows.map((item) => item.module);
    const restMarker = { value: 0 };

    const publishProgress = (value) => {
      const progress = clamp01(value);
      const stage = getStageIndex(progress);
      scene.root.dataset.progress = progress.toFixed(4);
      scene.root.dataset.stage = String(stage);
      if (stage !== stageRef.current) {
        stageRef.current = stage;
        onStageChange(stage);
      }
      if (import.meta.env.DEV) {
        window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { progress, stage } }));
      }
    };

    const context = gsap.context(() => {
      const { timeline, lighting, fabric } = HERO_SCENE;
      const pitch = () => scene.canvas.getBoundingClientRect().height * (fabric.bandPitch / HERO_SCENE.canvas.height);
      const railTravel = (index) => Math.max(0, modules[index].clientHeight - rails[index].offsetHeight - 2);

      gsap.set([...backs, ...fronts], { yPercent: -100, y: 0, force3D: true });
      gsap.set(rails, { y: 0, opacity: 0.82, force3D: true });
      gsap.set(exposures, { opacity: 0 });
      gsap.set(scene.roomDim, { opacity: 0 });
      gsap.set([scene.lampCore, scene.lampHalo], { opacity: 0 });
      if (hommyEyeGlow) gsap.set(hommyEyeGlow, { opacity: 0 });

      const animation = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
        onUpdate: () => publishProgress(animation.progress()),
      });

      animation
        .to([...backs, ...fronts], {
          yPercent: 0,
          duration: timeline.descentEnd - timeline.introEnd,
        }, timeline.introEnd)
        .to(rails, {
          y: (index) => railTravel(index),
          opacity: 1,
          duration: timeline.descentEnd - timeline.introEnd,
        }, timeline.introEnd)
        .to(fronts, {
          y: () => pitch() * (fabric.closedPhaseOffset / fabric.bandPitch),
          duration: timeline.privacyEnd - timeline.descentEnd,
        }, timeline.descentEnd)
        .to(exposures, {
          opacity: lighting.privacyWindowExposure,
          duration: timeline.privacyEnd - timeline.descentEnd,
        }, timeline.descentEnd)
        .to(scene.roomDim, {
          opacity: lighting.privacyRoomDim,
          duration: timeline.privacyEnd - timeline.descentEnd,
        }, timeline.descentEnd)
        .to(exposures, {
          opacity: lighting.ambientWindowExposure,
          duration: timeline.lampEnd - timeline.privacyEnd,
        }, timeline.privacyEnd)
        .to(scene.roomDim, {
          opacity: lighting.ambientRoomDim,
          duration: timeline.lampEnd - timeline.privacyEnd,
        }, timeline.privacyEnd)
        .to(scene.lampCore, {
          opacity: 1,
          duration: timeline.lampEnd - timeline.privacyEnd,
        }, timeline.privacyEnd)
        .to(scene.lampHalo, {
          opacity: lighting.haloMax,
          duration: timeline.lampEnd - timeline.privacyEnd,
        }, timeline.privacyEnd)
        .to(eyeGlowTarget, {
          opacity: 0.9,
          duration: timeline.lampEnd - timeline.privacyEnd,
        }, timeline.privacyEnd)
        .to(restMarker, {
          value: 1,
          duration: timeline.restEnd - timeline.lampEnd,
        }, timeline.lampEnd);

      timelineRef.current = animation;
      publishProgress(0);
      const setDebugProgress = (value) => {
        triggerRef.current?.getTween()?.kill();
        triggerRef.current?.disable(false, false);
        animation.pause();
        animation.progress(clamp01(Number(value)));
      };

      const media = gsap.matchMedia();
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      }, (matchContext) => {
        reducedMotionRef.current = matchContext.conditions.reduced;
        if (matchContext.conditions.reduced) {
          animation.progress(0);
          return undefined;
        }

        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: pinRef.current,
          animation,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          scrub: HERO_SCENE.scroll.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            scene.root.dataset.scrollStart = String(self.start);
            scene.root.dataset.scrollEnd = String(self.end);
          },
        });
        triggerRef.current = trigger;
        return () => {
          triggerRef.current = null;
          trigger.kill();
        };
      });

      const handleDebugProgress = (event) => {
        setDebugProgress(event.detail);
      };
      window.addEventListener(SET_PROGRESS_EVENT, handleDebugProgress);

      return () => {
        window.removeEventListener(SET_PROGRESS_EVENT, handleDebugProgress);
        media.revert();
      };
    }, sectionRef);

    if (import.meta.env.DEV) {
      window.homeEasyHeroDebug = {
        setProgress: (value) => {
          triggerRef.current?.getTween()?.kill();
          triggerRef.current?.disable(false, false);
          timelineRef.current?.pause().progress(clamp01(Number(value)));
        },
        getProgress: () => timelineRef.current?.progress() ?? 0,
        resumeScroll: () => {
          triggerRef.current?.enable();
          ScrollTrigger.refresh();
        },
      };
    }

    return () => {
      if (import.meta.env.DEV) delete window.homeEasyHeroDebug;
      triggerRef.current = null;
      timelineRef.current = null;
      context.revert();
    };
  }, [onStageChange, pinRef, sceneRef, sectionRef]);

  const setProgress = useCallback((progress, options = {}) => {
    const value = clamp01(progress);
    const trigger = triggerRef.current;
    if (trigger && !reducedMotionRef.current && !options.direct) {
      const top = trigger.start + (trigger.end - trigger.start) * value;
      window.scrollTo({ top, behavior: options.instant ? "auto" : "smooth" });
      return;
    }
    timelineRef.current?.progress(value);
  }, []);

  return { setProgress };
}

export const heroProgressEvents = {
  progress: PROGRESS_EVENT,
  setProgress: SET_PROGRESS_EVENT,
};
