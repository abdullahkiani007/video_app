interface HTMLVideoElement extends HTMLMediaElement {
  captureStream(frameRate?: number): MediaStream;
}

interface HTMLCanvasElement extends HTMLElement {
  captureStream(frameRate?: number): MediaStream;
}