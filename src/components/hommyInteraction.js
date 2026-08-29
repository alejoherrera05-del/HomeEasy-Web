import { HOMMY_TAP_DURATION } from "./hommyAnimation.js";

export const HOMMY_REDUCED_FEEDBACK_DURATION = 240;
export const HOMMY_DESKTOP_ANSWER_DWELL = 480;
export const HOMMY_DESKTOP_REACTION_WINDOW = 1100;
export const HOMMY_MOBILE_ANSWER_DWELL = HOMMY_TAP_DURATION;

export function getHommyInteractionTiming({ reducedMotion, mobile }) {
  if (reducedMotion) {
    return {
      reactionDuration: HOMMY_REDUCED_FEEDBACK_DURATION,
      answerDwell: HOMMY_REDUCED_FEEDBACK_DURATION,
      interactionDuration: HOMMY_REDUCED_FEEDBACK_DURATION,
    };
  }
  if (mobile) {
    return {
      reactionDuration: HOMMY_TAP_DURATION,
      answerDwell: HOMMY_MOBILE_ANSWER_DWELL,
      interactionDuration: HOMMY_TAP_DURATION,
    };
  }
  return {
    reactionDuration: HOMMY_DESKTOP_REACTION_WINDOW,
    answerDwell: HOMMY_DESKTOP_ANSWER_DWELL,
    interactionDuration: HOMMY_DESKTOP_ANSWER_DWELL,
  };
}

export function scheduleHommyAnswer({
  isFinalAnswer,
  timing,
  onAdvance,
  onUnlock,
  onReactionComplete = () => undefined,
  schedule = setTimeout,
}) {
  const events = new Map();
  const addEvent = (delay, callback) => {
    const callbacks = events.get(delay) ?? [];
    callbacks.push(callback);
    events.set(delay, callbacks);
  };
  const advanceDelay = isFinalAnswer ? timing.interactionDuration : timing.answerDwell;
  addEvent(advanceDelay, onAdvance);
  addEvent(timing.interactionDuration, onUnlock);
  addEvent(timing.reactionDuration, onReactionComplete);

  return [...events.entries()]
    .sort(([left], [right]) => left - right)
    .map(([delay, callbacks]) => schedule(() => callbacks.forEach((callback) => callback()), delay));
}
