export const DEFAULT_VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const DEFAULT_FRAGMENT_SHADER = `
uniform vec2 iResolution;
uniform float iTime;

void main() {
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`