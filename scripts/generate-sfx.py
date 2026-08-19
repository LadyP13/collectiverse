#!/usr/bin/env python3
"""Generate Game Boy beeps and a 5-second pretend dial-up handshake."""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / "assets" / "sfx"


def clamp(value: float) -> int:
    return max(-32767, min(32767, int(value * 32767)))


def write_wav(name: str, samples: list[float]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    with wave.open(str(path), "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(b"".join(struct.pack("<h", clamp(sample)) for sample in samples))
    print(f"wrote {path} ({len(samples) / RATE:.2f}s)")


def env(index: int, total: int, attack: int = 40, release: int = 80) -> float:
    if index < attack:
        return index / attack
    if index > total - release:
        return max(0.0, (total - index) / release)
    return 1.0


def pulse(freq: float, seconds: float, volume: float = 0.38, duty: float = 0.25) -> list[float]:
    n = int(seconds * RATE)
    out: list[float] = []
    for i in range(n):
        phase = (i * freq / RATE) % 1.0
        wave_ = 1.0 if phase < duty else -1.0
        out.append(wave_ * volume * env(i, n))
    return out


def sine(freq: float, seconds: float, volume: float = 0.22) -> list[float]:
    n = int(seconds * RATE)
    return [
        math.sin(2 * math.pi * freq * i / RATE) * volume * env(i, n, 30, 60)
        for i in range(n)
    ]


def mix_sines(freqs: list[float], seconds: float, volume: float = 0.18) -> list[float]:
    n = int(seconds * RATE)
    out: list[float] = []
    for i in range(n):
        sample = sum(math.sin(2 * math.pi * freq * i / RATE) for freq in freqs)
        out.append((sample / len(freqs)) * volume * env(i, n, 40, 80))
    return out


def noise(seconds: float, volume: float = 0.08) -> list[float]:
    n = int(seconds * RATE)
    return [random.uniform(-1, 1) * volume * env(i, n, 20, 40) for i in range(n)]


def silence(seconds: float) -> list[float]:
    return [0.0] * int(seconds * RATE)


def add(dest: list[float], src: list[float], at: float) -> None:
    start = int(at * RATE)
    need = start + len(src)
    if need > len(dest):
        dest.extend([0.0] * (need - len(dest)))
    for i, sample in enumerate(src):
        dest[start + i] += sample


DTMF = {
    "1": (697, 1209),
    "2": (697, 1336),
    "3": (697, 1477),
    "4": (770, 1209),
    "5": (770, 1336),
    "6": (770, 1477),
    "7": (852, 1209),
    "8": (852, 1336),
    "9": (852, 1477),
    "0": (941, 1336),
    "*": (941, 1209),
    "#": (941, 1477),
}


def dtmf(digit: str, seconds: float = 0.09) -> list[float]:
    low, high = DTMF[digit]
    return mix_sines([low, high], seconds, volume=0.26)


def sweep(start: float, end: float, seconds: float, volume: float = 0.16) -> list[float]:
    n = int(seconds * RATE)
    out: list[float] = []
    for i in range(n):
        t = i / max(1, n - 1)
        freq = start + (end - start) * t
        out.append(math.sin(2 * math.pi * freq * i / RATE) * volume * env(i, n, 20, 40))
    return out


def fsk(seconds: float, a: float = 1200, b: float = 2200, baud: float = 80) -> list[float]:
    n = int(seconds * RATE)
    bit_len = max(1, int(RATE / baud))
    out: list[float] = []
    bit = 0
    freq = a
    for i in range(n):
        if i % bit_len == 0:
            bit = 1 - bit
            freq = a if bit else b
        out.append(math.sin(2 * math.pi * freq * i / RATE) * 0.17 * env(i, n, 30, 50))
    return out


def warble(seconds: float) -> list[float]:
    n = int(seconds * RATE)
    out: list[float] = []
    for i in range(n):
        t = i / RATE
        carrier = 1800 + 700 * math.sin(2 * math.pi * 18 * t)
        extra = 900 * math.sin(2 * math.pi * 6 * t)
        sample = math.sin(2 * math.pi * (carrier + extra * 0.15) * t)
        hiss = random.uniform(-1, 1) * 0.12
        out.append((sample * 0.16 + hiss) * env(i, n, 40, 80))
    return out


def click() -> list[float]:
    n = int(0.04 * RATE)
    return [random.uniform(-1, 1) * 0.35 * env(i, n, 2, 30) for i in range(n)]


def melody(notes: list[tuple[float, float]], volume: float = 0.36) -> list[float]:
    samples: list[float] = []
    for freq, seconds in notes:
        samples.extend(pulse(freq, seconds, volume=volume))
        samples.extend(silence(0.012))
    return samples


def build_beeps() -> None:
    write_wav("beep-up.wav", pulse(880, 0.055, 0.34))
    write_wav("beep-down.wav", pulse(620, 0.055, 0.34))
    write_wav("beep-left.wav", pulse(740, 0.05, 0.32))
    write_wav("beep-right.wav", pulse(784, 0.05, 0.32))
    write_wav("beep-a.wav", melody([(1046, 0.045), (1318, 0.07)], 0.36))
    write_wav("beep-b.wav", melody([(784, 0.04), (523, 0.07)], 0.34))
    write_wav("beep-start.wav", melody([(523, 0.06), (659, 0.06), (784, 0.09)], 0.34))
    write_wav("beep-select.wav", pulse(392, 0.04, 0.26))
    write_wav("beep-heart.wav", melody([(659, 0.06), (880, 0.06), (1174, 0.1)], 0.32))


def build_dialup() -> None:
    track: list[float] = silence(5.15)
    add(track, click(), 0.04)
    add(track, mix_sines([350, 440], 0.42, 0.2), 0.18)
    number = "1800828588"
    t = 0.68
    for digit in number:
        add(track, dtmf(digit, 0.085), t)
        t += 0.11
    add(track, silence(0.05), t)
    add(track, mix_sines([440, 480], 0.38, 0.16), 1.82)
    add(track, silence(0.16), 2.22)
    add(track, mix_sines([440, 480], 0.28, 0.16), 2.38)
    add(track, sine(2100, 0.32, 0.2), 2.78)
    add(track, fsk(0.55, 1200, 2200, 70), 3.12)
    add(track, warble(0.7), 3.55)
    add(track, sweep(600, 2800, 0.22, 0.14), 4.18)
    add(track, sweep(2600, 900, 0.18, 0.14), 4.38)
    add(track, fsk(0.28, 1650, 1850, 140), 4.52)
    add(track, noise(0.2, 0.05), 4.55)
    add(track, pulse(1318, 0.08, 0.22), 4.88)
    add(track, pulse(1760, 0.1, 0.2), 4.96)
    peak = max((abs(sample) for sample in track), default=1.0)
    if peak > 0.95:
        track = [sample * (0.92 / peak) for sample in track]
    write_wav("dialup.wav", track)


if __name__ == "__main__":
    random.seed(42)
    build_beeps()
    build_dialup()
