import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_SCENE, HERO_STAGES, clamp01, getHeroProgressSnapshot } from "./heroScene.config.js";
import { publishMotionDebug } from "../motionDebug.js";
import {
  attachViewportRefreshHandlers,
  getViewportHeight,
  getViewportMode,
  getViewportWidth,
  isTouchViewport,
  listenForMediaQueryChange,
  REDUCED_MOTION_QUERY,
} from "../motionSupport.js";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const PROGRESS_EVENT = "homeeasy:hero-progress";
const SET_PROGRESS_EVENT = "homeeasy:hero-set-progress";
export const HERO_MOBILE_PRE_PIN = 112;

export function usesStableMobileHeroViewport(view = window) {
  const width = getViewportWidth(view);
  const height = getViewportHeight(view);
  return width <= 760 || (width <= 900 && height <= 650 && isTouchViewport(view));
}

export function getHeroPinStart(view = window) {
  return usesStableMobileHeroViewport(view) ? HERO_MOBILE_PRE_PIN : 0;
}

export function getScrollDistance(view = window, stableStageHeight = 0) {
  const { desktopVh, tabletVh, mobileVh } = HERO_SCENE.scroll;
  const width = getViewportWidth(view);
  const multiplier = width <= 760
    ? mobileVh
    : width <= 1050
      ? tabletVh
      : desktopVh;
  const stageHeight = Number(stableStageHeight);
  const viewportHeight = usesStableMobileHeroViewport(view)
    && Number.isFinite(stageHeight)
    && stageHeight > 0
    ? stageHeight
    : getViewportHeight(view);
  return viewportHeight * multiplier;
}

export function getHeroScrub(view = window) {
  return usesStableMobileHeroViewport(view)
    ? HERO_SCENE.scroll.scrub
    : HERO_SCENE.scroll.desktopScrub;
}

export function getHeroTiming(view = window) {
  return usesStableMobileHeroViewport(view)
    ? { timeline: HERO_SCENE.timeline, handoff: HERO_SCENE.handoff }
    : { timeline: HERO_SCENE.desktopTimeline, handoff: HERO_SCENE.desktopHandoff };
}

export function getHeroStageThresholds(view = window) {
  return usesStableMobileHeroViewport(view)
    ? HERO_SCENE.stageThresholds
    : HERO_SCENE.desktopStageThresholds;
}

export function getHeroStageProgress(stageIndex, view = window) {
  const index = Math.max(0, Math.min(HERO_STAGES.length - 1, Number(stageIndex) || 0));
  return usesStableMobileHeroViewport(view)
    ? HERO_STAGES[index].progress
    : HERO_SCENE.desktopStageProgress[index];
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
    const stageTrack = pinRef.current.querySelector(".stage-track");
    const windows = scene.windows;
    if (windows.length !== HERO_SCENE.windows.length) return undefined;

    const backs = windows.map((item) => item.back);
    const fronts = windows.map((item) => item.front);
    const rails = windows.map((item) => item.rail);
    const exposures = windows.map((item) => item.exposure);
    const modules = windows.map((item) => item.module);
    const restMarker = { value: 0 };

    const publishProgress = (value, scrollValue, activeTrigger = triggerRef.current) => {
      const progress = clamp01(value);
      const snapshot = getHeroProgressSnapshot(
        progress,
        scrollValue ?? activeTrigger?.progress ?? progress,
        getHeroStageThresholds(),
      );
      const { stage } = snapshot;
      scene.root.dataset.progress = progress.toFixed(4);
      scene.root.dataset.stage = String(stage);
      if (stage !== stageRef.current) {
        stageRef.current = stage;
        onStageChange(stage);
      }
      if (import.meta.env.DEV) {
        window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { progress, stage } }));
      }
      publishMotionDebug("hero", {
        scrollTriggerAvailable: typeof ScrollTrigger?.create === "function",
        scrollTriggerCreated: Boolean(activeTrigger),
        start: activeTrigger?.start ?? "n/a",
        end: activeTrigger?.end ?? "n/a",
        ...snapshot,
        viewportMode: getViewportMode(),
      });
    };

    const context = gsap.context(() => {
      const { lighting, fabric } = HERO_SCENE;
      const { timeline, handoff } = getHeroTiming();
      const pitch = () => scene.canvas.getBoundingClientRect().height * (fabric.bandPitch / HERO_SCENE.canvas.height);
      const railTravel = (index) => Math.max(0, modules[index].clientHeight - rails[index].offsetHeight - 2);

      gsap.set([...backs, ...fronts], { yPercent: -100, y: 0, force3D: true });
      gsap.set(rails, { y: 0, opacity: 0.82, force3D: true });
      gsap.set(exposures, { opacity: 0 });
      gsap.set(scene.roomDim, { opacity: 0 });
      gsap.set([scene.lampCore, scene.lampHalo], { opacity: 0 });
      if (hommyEyeGlow) gsap.set(hommyEyeGlow, { opacity: 0 });
      if (stageTrack) gsap.set(stageTrack, { autoAlpha: 1, y: 0 });

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

      if (stageTrack) {
        animation.to(stageTrack, {
          autoAlpha: 0,
          y: 8,
          duration: handoff.navFadeEnd - handoff.navFadeStart,
        }, handoff.navFadeStart);
      }

      timelineRef.current = animation;
      publishProgress(0);
      const setDebugProgress = (value) => {
        triggerRef.current?.getTween()?.kill();
        triggerRef.current?.disable(false, false);
        animation.pause();
        animation.progress(clamp01(Number(value)));
      };

      const syncHeroViewportMetrics = () => {
        if (usesStableMobileHeroViewport()) {
          sectionRef.current?.style.removeProperty("--hero-viewport-height");
          sectionRef.current?.style.setProperty(
            "--hero-scroll-distance",
            `${getScrollDistance(window, pinRef.current?.clientHeight)}px`,
          );
          return;
        }
        sectionRef.current?.style.removeProperty("--hero-scroll-distance");
        sectionRef.current?.style.setProperty("--hero-viewport-height", `${getViewportHeight()}px`);
      };

      const createScrollTrigger = () => {
        const stableMobile = usesStableMobileHeroViewport();
        const settleEndpoint = (self, endpoint) => {
          animation.pause().progress(endpoint);
          publishProgress(endpoint, endpoint, self);
        };
        const synchronizeLeaveEndpoint = (self, endpoint) => {
          if (!stableMobile) return;

          // Preserve the already-approved mobile release behavior. Desktop
          // numeric scrub is intentionally left running and is synchronized by
          // onScrubComplete, so a fast wheel gesture cannot create a hard cut.
          self.getTween()?.progress(1);
          settleEndpoint(self, endpoint);
        };
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          // Mobile uses one native sticky stage for both the pre-pin and the
          // animated range. GSAP only owns progress there, avoiding the fragile
          // sticky-to-fixed handoff that iOS Safari can visibly jump.
          pin: stableMobile ? false : pinRef.current,
          animation,
          // The mobile stage is natively sticky for a short, inert opening
          // range. Safari can settle its chrome before GSAP starts the pin and
          // the blind timeline, so one gesture produces one visual transition.
          start: () => getHeroPinStart(),
          end: () => `+=${getScrollDistance(window, pinRef.current?.clientHeight)}`,
          scrub: getHeroScrub(),
          anticipatePin: stableMobile ? 0 : 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => publishProgress(animation.progress(), self.progress, self),
          onLeave: (self) => synchronizeLeaveEndpoint(self, 1),
          onLeaveBack: (self) => synchronizeLeaveEndpoint(self, 0),
          onScrubComplete: (self) => {
            if (self.progress >= 0.9999) settleEndpoint(self, 1);
            else if (self.progress <= 0.0001) settleEndpoint(self, 0);
          },
          onRefresh: (self) => {
            scene.root.dataset.scrollStart = String(self.start);
            scene.root.dataset.scrollEnd = String(self.end);
            animation.pause().progress(self.progress);
            publishProgress(self.progress, self.progress, self);
            publishMotionDebug("hero", {
              scrollTriggerCreated: true,
              start: self.start,
              end: self.end,
              lastRefresh: new Date().toISOString(),
              viewportMode: getViewportMode(),
            });
          },
        });
        triggerRef.current = trigger;
        publishProgress(animation.progress(), trigger.progress, trigger);
      };

      const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      const applyMotionPreference = () => {
        const currentProgress = animation.progress();
        triggerRef.current?.kill();
        triggerRef.current = null;
        reducedMotionRef.current = mediaQuery.matches;
        syncHeroViewportMetrics();
        if (!mediaQuery.matches) createScrollTrigger();
        else {
          animation.progress(currentProgress);
          publishMotionDebug("hero", {
            scrollTriggerCreated: false,
            start: "n/a",
            end: "n/a",
            scrollProgress: Number(currentProgress.toFixed(4)),
          });
        }
      };
      const removeMotionPreferenceListener = listenForMediaQueryChange(mediaQuery, applyMotionPreference);
      applyMotionPreference();

      const refreshHero = () => {
        syncHeroViewportMetrics();
        if (triggerRef.current) triggerRef.current.refresh();
        else publishMotionDebug("hero", {
          lastRefresh: new Date().toISOString(),
          viewportMode: getViewportMode(),
        });
      };
      const removeViewportRefreshHandlers = attachViewportRefreshHandlers(refreshHero, {
        ignoreHeightOnlyResize: true,
      });
      refreshHero();

      const handleDebugProgress = (event) => {
        setDebugProgress(event.detail);
      };
      window.addEventListener(SET_PROGRESS_EVENT, handleDebugProgress);

      return () => {
        window.removeEventListener(SET_PROGRESS_EVENT, handleDebugProgress);
        removeMotionPreferenceListener();
        removeViewportRefreshHandlers();
        triggerRef.current?.kill();
        triggerRef.current = null;
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

  const setStage = useCallback((stageIndex, options = {}) => {
    setProgress(getHeroStageProgress(stageIndex), options);
  }, [setProgress]);

  return { setProgress, setStage };
}

export const heroProgressEvents = {
  progress: PROGRESS_EVENT,
  setProgress: SET_PROGRESS_EVENT,
};
