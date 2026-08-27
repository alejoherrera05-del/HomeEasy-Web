from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RIG = ROOT / "public" / "assets" / "hommy-rig"
OUTPUT = ROOT / "work" / "hommy-motion-qa.png"
CONTACT_OUTPUT = ROOT / "work" / "hommy-contact-qa.png"
SIZE = (1254, 1254)
MARGIN = 627
WORK_SIZE = (SIZE[0] + MARGIN * 2, SIZE[1] + MARGIN * 2)
SHOULDER = (355 + MARGIN, 678 + MARGIN)
ELBOW = (288 + MARGIN, 906 + MARGIN)
WRIST = (288 + MARGIN, 1112 + MARGIN)
POINTING_WRIST = (312 + MARGIN, 1112 + MARGIN)


@dataclass(frozen=True)
class Frame:
    label: str
    upper: float
    shoulder_rotor: float
    elbow: float
    rest: float
    transition_hand: float
    bridge_hand: float
    pointer_hand: float
    rest_hand_opacity: float
    transition_opacity: float
    bridge_opacity: float
    pointer_opacity: float
    head: float
    gaze_opacity: float


FRAMES = [
    Frame("idle", 0, 0, 0, 0, 84, 84, 92, 1, 0, 0, 0, 0, 0),
    Frame("look", 0, 0, 0, 0, 84, 84, 92, 1, 0, 0, 0, 1.2, 1),
    Frame("shoulder starts", -8, 2, -3, -5, 84, 84, 92, 1, 0, 0, 0, 2.0, 1),
    Frame("lift low", -20, 5, -8, -14, 84, 84, 92, 1, 0, 0, 0, 2.7, 1),
    Frame("lift mid", -30, 7, -13, -25, 84, 84, 92, 1, 0, 0, 0, 2.8, 1),
    Frame("transition in", -34, 8, -15, -29, 84, 84, 92, 0, 1, 0, 0, 2.9, 1),
    Frame("transition follows", -38, 9, -18, -34, 84, 84, 92, 0, 1, 0, 0, 3.0, 1),
    Frame("bridge mid", -42, 10, -21, -39, 84, 84, 92, 0, 0, 1, 0, 3.05, 1),
    Frame("bridge ready", -44, 11, -23, -43, -30, 84, 92, 0, 0, 1, 0, 3.1, 1),
    Frame("hover", -46, 12, -25, -46, -30, 84, 96, 0, 0, 0, 1, 3.1, 1),
    Frame("press", -48, 13, -27, -48, -30, 84, 108, 0, 0, 0, 1, 3.15, 1),
    Frame("rebound", -47, 12, -25, -46, -30, 84, 104, 0, 0, 0, 1, 3.0, 1),
    Frame("release", -46, 11, -24, -45, -30, 84, 98, 0, 0, 0, 1, 2.75, 1),
    Frame("bridge return", -38, 7, -17, -33, 84, 84, 92, 0, 0, 1, 0, 2.1, 1),
    Frame("transition return", -28, 5, -11, -22, 84, 84, 92, 0, 1, 0, 0, 1.8, 1),
    Frame("rest return", -18, 3, -6, -12, 84, 84, 92, 1, 0, 0, 0, 1.6, 1),
    Frame("idle", 0, 0, 0, 0, 84, 84, 92, 1, 0, 0, 0, 0, 0),
]


@lru_cache(maxsize=None)
def load_base(name: str) -> Image.Image:
    source = Image.open(RIG / name).convert("RGBA")
    padded = Image.new("RGBA", WORK_SIZE, (0, 0, 0, 0))
    padded.alpha_composite(source, (MARGIN, MARGIN))
    return padded


def load(name: str) -> Image.Image:
    return load_base(name).copy()


def opacity(image: Image.Image, value: float) -> Image.Image:
    if value >= 1:
        return image
    result = image.copy()
    result.putalpha(result.getchannel("A").point(lambda alpha: round(alpha * value)))
    return result


def css_rotate(image: Image.Image, degrees: float, pivot: tuple[int, int]) -> Image.Image:
    return image.rotate(-degrees, center=pivot, resample=Image.Resampling.BICUBIC)


def over(base: Image.Image, layer: Image.Image) -> None:
    base.alpha_composite(layer)


def render(frame: Frame) -> Image.Image:
    canvas = Image.new("RGBA", WORK_SIZE, (0, 0, 0, 0))
    over(canvas, load("body-clean-contact.png"))
    over(canvas, load("torso-shell.png"))
    over(canvas, load("shoulder-fixed.png"))

    head = load("head.png")
    over(head, opacity(load("head-gaze.png"), frame.gaze_opacity))
    over(canvas, css_rotate(head, frame.head, (627 + MARGIN, 545 + MARGIN)))
    idle_distal = load("forearm-clean-v2.png")
    rest_hand = css_rotate(load("free-hand-tap.png"), 0, WRIST)
    over(idle_distal, opacity(rest_hand, frame.rest_hand_opacity))
    transition_hand = css_rotate(
        load("transition-hand-half-curled-matched-v1.png"),
        frame.transition_hand,
        POINTING_WRIST,
    )
    over(idle_distal, opacity(transition_hand, frame.transition_opacity))
    bridge_hand = css_rotate(
        load("bridge-hand-matched.png"), frame.bridge_hand, POINTING_WRIST
    )
    over(idle_distal, opacity(bridge_hand, frame.bridge_opacity))
    pointer_hand = css_rotate(
        load("pointing-hand-matched.png"), frame.pointer_hand, POINTING_WRIST
    )
    over(idle_distal, opacity(pointer_hand, frame.pointer_opacity))
    idle_distal = css_rotate(idle_distal, frame.rest, ELBOW)

    arm = load("upper-arm-clean-v2.png")
    elbow = css_rotate(load("elbow-rotor-official-v3.png"), frame.elbow, ELBOW)
    over(arm, idle_distal)
    over(arm, elbow)
    shoulder_rotor = css_rotate(
        load("shoulder-rotor-official-v4.png"), frame.shoulder_rotor, SHOULDER
    )
    over(arm, shoulder_rotor)
    arm = css_rotate(arm, frame.upper, SHOULDER)
    over(canvas, arm)
    # The tablet back is physically between the viewer and the screen-facing
    # tapping finger. Drawing it last makes the fingertip disappear around the
    # far edge instead of looking pasted on top of the tablet back.
    over(canvas, load("tablet-contact-edge.png"))
    crop = canvas.crop((MARGIN, MARGIN, MARGIN + SIZE[0], MARGIN + SIZE[1]))
    result = Image.new("RGBA", SIZE, (214, 212, 208, 255))
    over(result, crop)
    return result


def main() -> None:
    thumbs: list[Image.Image] = []
    for frame in FRAMES:
        image = render(frame)
        image.thumbnail((314, 314), Image.Resampling.LANCZOS)
        tile = Image.new("RGBA", (334, 354), (245, 244, 242, 255))
        tile.alpha_composite(image, (10, 10))
        drawing = ImageDraw.Draw(tile)
        drawing.text((14, 328), frame.label, fill=(45, 43, 41, 255))
        thumbs.append(tile)

    rows = (len(thumbs) + 3) // 4
    strip = Image.new("RGBA", (334 * 4, 354 * rows), (232, 230, 227, 255))
    for index, tile in enumerate(thumbs):
        strip.alpha_composite(tile, ((index % 4) * 334, (index // 4) * 354))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    strip.save(OUTPUT, optimize=True)
    render(next(frame for frame in FRAMES if frame.label == "press")).save(
        CONTACT_OUTPUT, optimize=True
    )
    print(OUTPUT)
    print(CONTACT_OUTPUT)


if __name__ == "__main__":
    main()
