from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
RIG = ROOT / "public" / "assets" / "hommy-rig"
HOMMY = ROOT / "public" / "assets" / "hommy"

EYE_BAND = (536, 298, 819, 430)
GAZE_BAND = (500, 266, 830, 462)


def eye_band_mask(size: tuple[int, int]) -> Image.Image:
    mask = Image.new("L", size, 0)
    drawing = ImageDraw.Draw(mask)
    drawing.rounded_rectangle(EYE_BAND, radius=48, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(9))


def gaze_band_mask(size: tuple[int, int]) -> Image.Image:
    mask = Image.new("L", size, 0)
    drawing = ImageDraw.Draw(mask)
    drawing.rounded_rectangle(GAZE_BAND, radius=70, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(9))


def composite_eye_band(base_path: Path, face_source_path: Path, output_path: Path) -> None:
    base = Image.open(base_path).convert("RGBA")
    face_source = Image.open(face_source_path).convert("RGBA")
    if face_source.size != base.size:
        face_source = face_source.resize(base.size, Image.Resampling.LANCZOS)
    result = Image.composite(face_source, base, eye_band_mask(base.size))
    result.save(output_path, optimize=True)


def build_clean_gaze() -> None:
    """Replace the entire screen expression so brows can never be duplicated."""
    base = Image.open(RIG / "head.png").convert("RGBA")
    gaze = Image.open(RIG / "eyes-tablet-full.png").convert("RGBA")
    result = Image.composite(gaze, base, gaze_band_mask(base.size))
    result.save(RIG / "head-gaze.png", optimize=True)


def build_fixed_shoulder() -> None:
    """Remove the straight torso cut and retain only the fixed mechanical socket."""
    source = Image.open(RIG / "torso-patch.png").convert("RGBA")
    mask = Image.new("L", source.size, 0)
    drawing = ImageDraw.Draw(mask)
    drawing.ellipse((356, 570, 506, 806), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(7))
    alpha = Image.composite(source.getchannel("A"), Image.new("L", source.size, 0), mask)
    source.putalpha(alpha)
    source.save(RIG / "shoulder-fixed.png", optimize=True)


def build_torso_shell() -> None:
    """Build one fixed torso surface and fill the removed-arm socket underneath it.

    Existing torso pixels stay byte-for-byte identical to body-clean-contact. The
    arm-free source contributes only where that body is transparent, so the shell
    closes the shoulder opening without recolouring Hommy's approved chest.
    """
    body = Image.open(RIG / "body-clean-contact.png").convert("RGBA")
    arm_free = Image.open(RIG / "clean-body-generated.png").convert("RGBA")
    filled = Image.alpha_composite(arm_free, body)

    mask = Image.new("L", filled.size, 0)
    drawing = ImageDraw.Draw(mask)
    drawing.polygon(
        [
            (330, 535),
            (830, 535),
            (865, 705),
            (835, 900),
            (780, 925),
            (460, 925),
            (350, 850),
            (330, 650),
        ],
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(6))
    filled.putalpha(ImageChops.multiply(filled.getchannel("A"), mask))
    filled.save(RIG / "torso-shell.png", optimize=True)


def match_burgundy_to_official(image: Image.Image) -> Image.Image:
    """Match only burgundy paint, leaving gold, black and skin-edge alpha intact."""
    result = image.copy().convert("RGBA")
    pixels = list(result.getdata())
    matched: list[tuple[int, int, int, int]] = []
    for red, green, blue, alpha in pixels:
        is_burgundy = (
            alpha > 0
            and red > 70
            and red > green * 1.15
            and red > blue * 1.10
            and green < 150
        )
        if is_burgundy:
            red = round((red - 141.71) * 0.834 + 131.52)
            green = round((green - 47.63) * 1.043 + 59.55)
            blue = round((blue - 42.10) * 1.016 + 50.94)
            # Final calibration against forearm-clean-v2: remove the visible
            # darkening when the pointing hand replaces the official hand.
            red += 9
            green += 15
            blue += 14
            red = max(0, min(255, red))
            green = max(0, min(255, green))
            blue = max(0, min(255, blue))
        matched.append((red, green, blue, alpha))
    result.putdata(matched)
    return result


def build_pointing_hand() -> None:
    """Extract only the pointing hand and align it to the official wrist.

    The official shoulder, upper arm and forearm never change images. This is the
    smallest possible pose substitution and therefore preserves colour and anatomy.
    """
    source = match_burgundy_to_official(
        Image.open(RIG / "free-arm-tap.png").convert("RGBA")
    )
    mask = Image.new("L", source.size, 0)
    drawing = ImageDraw.Draw(mask)
    # Keep only the articulated wrist cuff and hand.  The earlier x=610 cut
    # retained a long piece of the generated forearm; once nested inside the
    # official forearm it produced the doubled burgundy strip visible during
    # contact.  The diagonal edge now sits under the official distal cuff.
    drawing.polygon(
        [(664, 742), (700, 706), (972, 650), (990, 930), (670, 950)],
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))

    aligned = Image.new("RGBA", source.size, (0, 0, 0, 0))
    # Keep a 26 px overlap inside the official wrist cuff while advancing the
    # fingertip beyond the tablet bevel and onto the visible screen plane.
    aligned.alpha_composite(source, dest=(-341, 282))
    aligned.save(RIG / "pointing-hand-matched.png", optimize=True)


def build_bridge_hand() -> None:
    """Create the partial-extension hand used between rest and contact."""
    source = match_burgundy_to_official(
        Image.open(RIG / "bridge-hand-isolated.png").convert("RGBA")
    )
    calibrated = []
    for red, green, blue, alpha in source.getdata():
        burgundy = (
            alpha > 0
            and red > 70
            and red > green * 1.15
            and red > blue * 1.10
            and green < 150
        )
        if burgundy:
            red = max(0, red - 11)
            green = max(0, green - 6)
            blue = max(0, blue - 4)
        calibrated.append((red, green, blue, alpha))
    source.putdata(calibrated)
    hand = source.crop((186, 430, 1055, 834)).resize((365, 170), Image.Resampling.LANCZOS)
    aligned = Image.new("RGBA", source.size, (0, 0, 0, 0))
    # Source connector pivot lands at the calibrated pointing wrist.
    aligned.alpha_composite(hand, dest=(287, 1024))
    aligned.save(RIG / "bridge-hand-matched.png", optimize=True)


def remove_connected_checkerboard(source: Image.Image) -> Image.Image:
    """Remove the generated bright-neutral checkerboard without eating metal highlights."""
    result = source.convert("RGBA")
    width, height = result.size
    pixels = list(result.getdata())
    candidate = bytearray(width * height)
    for index, (red, green, blue, _) in enumerate(pixels):
        candidate[index] = int(
            min(red, green, blue) >= 145
            and max(red, green, blue) - min(red, green, blue) <= 20
        )

    background = bytearray(width * height)
    queue: deque[int] = deque()
    for x in range(width):
        for index in (x, (height - 1) * width + x):
            if candidate[index] and not background[index]:
                background[index] = 1
                queue.append(index)
    for y in range(height):
        for index in (y * width, y * width + width - 1):
            if candidate[index] and not background[index]:
                background[index] = 1
                queue.append(index)

    while queue:
        index = queue.popleft()
        x = index % width
        for neighbour in (
            index - width if index >= width else -1,
            index + width if index < width * (height - 1) else -1,
            index - 1 if x else -1,
            index + 1 if x < width - 1 else -1,
        ):
            if neighbour >= 0 and candidate[neighbour] and not background[neighbour]:
                background[neighbour] = 1
                queue.append(neighbour)

    alpha = Image.new("L", result.size, 255)
    alpha.putdata([0 if value else 255 for value in background])
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))
    result.putalpha(alpha)
    return result


def build_half_curled_transition_hand() -> None:
    """Prepare the identity-preserving half-curled hand for the first wrist phase."""
    source = remove_connected_checkerboard(
        Image.open(RIG / "transition-hand-half-curled-v1.png")
    )
    calibrated = []
    for red, green, blue, alpha in source.getdata():
        gold = (
            alpha > 0
            and red > 110
            and green > 65
            and red > green * 1.15
            and green > blue * 1.25
            and green > red * 0.5
            and blue < 130
        )
        burgundy = (
            alpha > 0
            and red > 70
            and red > green * 1.15
            and red > blue * 1.10
            and green < 150
        )
        if gold:
            red = max(0, red - 21)
            green = min(255, green + 12)
            blue = min(255, blue + 16)
        elif burgundy:
            red = max(0, red - 8)
            green = min(255, green + 18)
            blue = min(255, blue + 18)
        calibrated.append((red, green, blue, alpha))
    source.putdata(calibrated)

    bounds = source.getchannel("A").point(lambda value: 255 if value > 18 else 0).getbbox()
    if bounds is None:
        raise ValueError("transition hand has no foreground after background removal")
    hand = source.crop(bounds)
    target_width = 365
    target_height = round(hand.height * target_width / hand.width)
    hand = hand.resize((target_width, target_height), Image.Resampling.LANCZOS)

    aligned = Image.new("RGBA", source.size, (0, 0, 0, 0))
    aligned.alpha_composite(hand, dest=(267, 1005))
    aligned.save(RIG / "transition-hand-half-curled-matched-v1.png", optimize=True)


def build_joint_cap(source_name: str, bounds: tuple[int, int, int, int], output_name: str) -> None:
    source = Image.open(RIG / source_name).convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).ellipse(bounds, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5))
    alpha = Image.composite(source.getchannel("A"), Image.new("L", source.size, 0), mask)
    source.putalpha(alpha)
    source.save(RIG / output_name, optimize=True)


def build_masked_segment(
    source_name: str,
    polygon: list[tuple[int, int]],
    output_name: str,
) -> None:
    """Remove neighbouring body scraps while retaining the official painted segment."""
    source = Image.open(RIG / source_name).convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))
    source.save(RIG / output_name, optimize=True)


def build_elbow_rotor() -> None:
    """Isolate the official circular elbow mechanism without either red limb.

    The old forearm layer included a horizontal slice of the upper arm. Once the
    forearm rotated, that slice became a visible spike. The rotor is now its own
    articulated layer: gold disc, dark bellows and metallic rings only.
    """
    source = Image.open(RIG / "free-forearm.png").convert("RGBA")
    mask = Image.new("L", source.size, 0)
    drawing = ImageDraw.Draw(mask)
    # Visible side disc and the dark accordion core. Neither selection reaches
    # the painted upper/lower shells, so rotation cannot expose a red spike.
    drawing.ellipse((221, 848, 309, 944), fill=255)
    drawing.polygon(
        [(274, 858), (339, 858), (355, 895), (346, 932), (318, 956), (274, 936)],
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(0.65))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))
    # Prevent bright RGB values hidden under zero alpha from becoming white
    # fringes when the browser bicubic-rotates the transparent PNG.
    cleaned = []
    for red, green, blue, alpha in source.getdata():
        cleaned.append((red, green, blue, alpha) if alpha else (0, 0, 0, 0))
    source.putdata(cleaned)
    source.save(RIG / "elbow-rotor-v2.png", optimize=True)


def build_generated_elbow_rotor() -> None:
    """Align the clean round contact elbow from the identity-preserving reference.

    This cover sits above both limb shells, so the rotating joint remains circular
    while the original Hommy pixels still provide the upper arm and forearm.
    """
    source = match_burgundy_to_official(
        Image.open(RIG / "hommy-contact-reference-v2.png").convert("RGBA")
    )
    bounds = (391, 807, 497, 917)
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).ellipse(bounds, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))

    rotor = source.crop(bounds).resize((119, 123), Image.Resampling.LANCZOS)
    aligned = Image.new("RGBA", source.size, (0, 0, 0, 0))
    aligned.alpha_composite(rotor, dest=(229, 844))
    aligned.save(RIG / "elbow-rotor-contact-v3.png", optimize=True)


def build_official_elbow_rotor_cover() -> None:
    """Enlarge the official rotor around its true centre to cover both shell seams."""
    source = Image.open(RIG / "elbow-rotor-v2.png").convert("RGBA")
    rotor = source.crop((226, 838, 355, 973)).resize((142, 149), Image.Resampling.LANCZOS)
    aligned = Image.new("RGBA", source.size, (0, 0, 0, 0))
    aligned.alpha_composite(rotor, dest=(217, 832))
    aligned.save(RIG / "elbow-rotor-official-v3.png", optimize=True)


def build_official_shoulder_rotor() -> None:
    """Keep only the red moving shoulder shell and its gold face.

    The earlier generic joint crop also captured the stationary gear behind the
    shoulder.  Rotating that combined image exposed a pale tooth above the arm.
    A tight ellipse follows the red shell while the separate shoulder-fixed
    layer supplies the socket that belongs to the torso.
    """
    source = Image.open(RIG / "free-upper-arm.png").convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).ellipse((296, 598, 438, 762), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.1))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))
    source.save(RIG / "shoulder-rotor-official-v4.png", optimize=True)


def build_tablet_contact_edge() -> None:
    """Keep only the tablet's near bevel as the fingertip occlusion layer.

    The complete foreground also contained Hommy's supporting forearm and hand.
    Putting that whole cutout above the tapping arm made the two arms visually
    collide. The base body already contains the complete tablet pose, so the
    foreground only needs this narrow diagonal bevel to make the fingertip pass
    behind the tablet at the instant of contact.
    """
    source = Image.open(RIG / "tablet-foreground.png").convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).polygon(
        [(1011, 704), (1065, 704), (958, 889), (906, 889)],
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))
    source.putalpha(ImageChops.multiply(source.getchannel("A"), mask))
    source.save(RIG / "tablet-contact-edge.png", optimize=True)


def main() -> None:
    build_clean_gaze()
    build_fixed_shoulder()
    build_torso_shell()
    build_pointing_hand()
    build_bridge_hand()
    build_half_curled_transition_hand()
    build_masked_segment(
        "free-upper-arm.png",
        [(304, 682), (397, 706), (406, 759), (370, 874), (253, 878), (246, 838), (274, 758)],
        "upper-arm-clean-v2.png",
    )
    build_masked_segment(
        "free-forearm.png",
        [(216, 918), (251, 902), (331, 904), (360, 932), (366, 1124), (342, 1155), (224, 1155), (214, 944)],
        "forearm-clean-v2.png",
    )
    build_elbow_rotor()
    build_generated_elbow_rotor()
    build_official_elbow_rotor_cover()
    build_official_shoulder_rotor()
    build_tablet_contact_edge()
    build_joint_cap("free-forearm.png", (220, 846, 354, 966), "elbow-cap-fixed.png")
    composite_eye_band(
        RIG / "head.png",
        RIG / "face-clean-full.png",
        RIG / "head-blink.png",
    )
    composite_eye_band(
        HOMMY / "hommy-official.png",
        RIG / "face-clean-full.png",
        HOMMY / "hommy-official-blink.png",
    )
    print(RIG / "head-gaze.png")
    print(RIG / "shoulder-fixed.png")
    print(RIG / "torso-shell.png")
    print(RIG / "pointing-hand-matched.png")
    print(RIG / "bridge-hand-matched.png")
    print(RIG / "transition-hand-half-curled-matched-v1.png")
    print(RIG / "upper-arm-clean-v2.png")
    print(RIG / "elbow-rotor-v2.png")
    print(RIG / "elbow-rotor-contact-v3.png")
    print(RIG / "elbow-rotor-official-v3.png")
    print(RIG / "forearm-clean-v2.png")
    print(RIG / "shoulder-rotor-official-v4.png")
    print(RIG / "tablet-contact-edge.png")
    print(RIG / "elbow-cap-fixed.png")
    print(RIG / "head-blink.png")
    print(HOMMY / "hommy-official-blink.png")


if __name__ == "__main__":
    main()
