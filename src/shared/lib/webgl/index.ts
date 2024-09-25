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
  precision mediump float;  // Добавляем точность

  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;

  uniform float time;

  void main() {
    vUv = uv;
    
    // Анимация масштабирования
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

  // Функция генерации шума
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Генерация фрактального шума
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
    
    // Использование шума для создания динамичных текстур
    float n = noise(st + time * 0.1);
    
    // Переливание цветов
    vec3 color = vec3(0.5 + 0.5 * sin(time + vUv.x * 10.0), 
                      0.5 + 0.5 * cos(time + vUv.y * 5.0), 
                      0.5 + 0.5 * sin(time * 0.5));
    
    // Применение шума к финальному цвету
    color += vec3(n) * 0.1;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

// Second fragment shader (spiral effect, colorful)
const fragmentShaderSource2 = `
precision mediump float;
varying vec2 vUv;
uniform float time;

void main() {
    // Нормализуем координаты
    vec2 st = (vUv - 0.5) * 2.0;

    // Центрируем спираль и уменьшаем ее радиус
    st *= 0.6;

    // Рассчитываем полярные координаты
    float r = length(st);      // расстояние от центра
    float a = atan(st.y, st.x); // угол

    // Спираль Фибоначчи с анимацией закручивания
    float spiral = sin(10.0 * a + r * 20.0 - time * 4.0); // управляй скоростью и плотностью спирали

    // Параметры для закручивания
    vec3 color = vec3(0.0);
    if (mod(a + time, 6.28318) < 3.14159) { // Создаем чередующиеся участки
        color = mix(vec3(1.0, 1.0, 1.0), vec3(0.2, 0.2, 0.8), step(0.5, fract(spiral))); // белый-синий
    } else {
        color = mix(vec3(0.2, 0.2, 0.8), vec3(0.0, 0.0, 0.0), step(0.5, fract(spiral))); // синий-черный
    }

    // Увеличиваем контраст и четкость
    color *= smoothstep(1.0, 0.0, r * 2.0);

    // Ограничиваем спираль в пределах радиуса, создавая компактный эффект
    if (r > 1.0) {
        discard;
    }

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

  // Create program
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

    // Update time uniform
    gl.uniform1f(timeLocation, time * 0.001)

    // Draw the geometry
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(animate as FrameRequestCallback)
  }

  animate(0)
}

export { useWebGLLoading }
