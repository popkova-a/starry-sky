# starry-sky

A WebGL 2.0 visualization of an animated night sky filled with twinkling, drifting stars. The scene is rendered using instanced drawing, so hundreds of stars are drawn from a single geometry in one call.

## Features

- **Animated starfield** — 300 stars rendered against a deep-blue night sky.
- **Instanced rendering** — every star shares one sphere geometry and is drawn with a single `drawElementsInstanced` call; per-instance attributes give each star its own position, size, and motion.
- **Per-star animation** — each star scales, rotates, and twinkles independently, driven by a time uniform passed to the shaders.
- **Twinkling effect** — star opacity oscillates over time using each instance's ID, so no two stars blink in sync.
- **Alpha blending** for soft, glowing stars.

## Tech Stack

- **Language:** JavaScript (ES6), GLSL ES 3.00 shaders
- **Graphics API:** WebGL 2.0
- **Libraries:** [gl-matrix](https://glmatrix.net/) for matrix math, plus WebGL helper utilities
- **Runtime:** runs in any browser with WebGL 2.0 support

## Project Structure

```
starry-sky/
├── starry_sky.html         # entry page — sets up the canvas and loads scripts
├── starry_sky.js           # main program: shaders, geometry, instancing, animation loop
│
├── lib/                    # third-party WebGL helper libraries
│   ├── gl-matrix.js        # vector / matrix math
│   ├── cuon-utils.js       # shader initialization helpers
│   ├── webgl-utils.js      # WebGL context setup utilities
│   └── webgl-debug.js      # WebGL debugging helpers
│
└── README.md
```

## Getting Started

### Prerequisites

- A modern web browser with **WebGL 2.0** support (recent Chrome, Firefox, or Edge).

### Running

Because the page loads scripts via relative paths, serve the folder over a local web server rather than opening the file directly (opening via `file://` can be blocked by browser security policies).

1. Clone the repository:
   ```bash
   git clone https://github.com/popkova-a/starry-sky.git
   cd starry-sky
   ```
2. Start a simple local server, for example with Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000/starry_sky.html` in your browser.

## How It Works

A single star is built as a small UV sphere (`latitudeBands` × `longitudeBands`) and uploaded once as shared vertex and index buffers. Per-instance attributes — offset, scaling coefficient, rotation speed, and base alpha — are supplied so that one `drawElementsInstanced` call renders all 300 stars. The vertex shader applies each star's scaling and time-based rotation matrices and computes a per-instance twinkling alpha from `u_Time` and `gl_InstanceID`; the fragment shader paints each star white with that alpha. An animation loop updates `u_Time` every frame via `requestAnimationFrame`, producing the continuous drift and twinkle.

## License

This project was created for educational purposes as a university assignment.
