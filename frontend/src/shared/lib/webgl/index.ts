// Compile shader
function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Shader could not be created')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed')
  }

  return shader
}

// Basic Vertex Shader
const vertexShaderSource = `
  precision mediump float;

  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;

  uniform float time;

  void main() {
    vUv = uv;
    
    float scale = 1.0 + 0.2 * sin(time * 2.0);
    vec3 pos = position;

    gl_Position = vec4(pos, 1.0);
  }
`

// Basic Fragment Shader
const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vUv;

  uniform float time;

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 st = vUv * 3.0;
    
    float n = noise(st + time * 0.1);
    
    vec3 color = vec3(0.5 + 0.5 * sin(time + vUv.x * 10.0), 
                      0.5 + 0.5 * cos(time + vUv.y * 5.0), 
                      0.5 + 0.5 * sin(time * 0.5));
    
    color += vec3(n) * 0.1;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

const useWebGLLoading = () => {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  const gl = canvas.getContext('webgl')

  if (!gl) {
    throw new Error('WebGL not supported')
  }

  function resizeCanvas() {
    if (!gl) {
      throw new Error('WebGL not supported')
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const program = gl.createProgram()
  if (!program) throw new Error('WebGL Program creation failed')

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed')
  }

  gl.useProgram(program)

  // Create vertices for the quad
  const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0])

  const uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

  // Create buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const uvBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // Link position attribute
  const positionLocation = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

  // Link uv attribute
  const uvLocation = gl.getAttribLocation(program, 'uv')
  gl.enableVertexAttribArray(uvLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0)

  // Get uniform location
  const timeLocation = gl.getUniformLocation(program, 'time')

  // Animation loop
  function animate(time: number) {
    if (!gl) {
      throw new Error('WebGL not supported')
    }
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.uniform1f(timeLocation, time * 0.001)

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(animate as FrameRequestCallback)
  }

  animate(0)
}

export { useWebGLLoading }
