"use client";

import { useEffect, useRef } from "react";

/**
 * NeuralNoise — shader WebGL com padrão neural que segue o mouse/toque.
 * Adaptado de 21st.dev para LADO ₿.
 *
 * Default color alinhado à paleta da marca: dourado #ffc60a.
 *
 * Visual: padrão orgânico rotativo iterativo com 15 octaves, reage à
 * posição do cursor, cara de AI/rede neural. Textura rica = ótimo pra
 * liquid glass distorcer por cima.
 */

interface NeuralNoiseProps {
  /** Cor RGB normalizada 0-1. Default: dourado Bitcoin [1.0, 0.776, 0.039] */
  color?: [number, number, number];
  /** Opacidade do canvas (0-1). Default 0.95 */
  opacity?: number;
  /** Velocidade da animação. Default 0.001 */
  speed?: number;
  /** Classe extra (ex: "-z-10 fixed inset-0") */
  className?: string;
}

export function NeuralNoise({
  color = [1.0, 0.776, 0.039], // #ffc60a — LADO ₿
  opacity = 0.95,
  speed = 0.001,
  className,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};
    let rafId = 0;

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;

      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }

      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.0);
        vec2 res = vec2(0.0);
        float scale = 8.0;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.0);
          sine_acc = rotate(sine_acc, 1.0);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }
        return res.x + res.y;
      }

      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0.0, 1.0);
        p = 0.5 * pow(1.0 - p, 2.0);
        float t = u_speed * u_time;
        vec3 col = vec3(0.0);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.0);
        noise += pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= (1.0 - length(vUv - 0.5));
        col = u_color * noise;
        gl_FragColor = vec4(col, noise);
      }
    `;

    function createShader(
      g: WebGLRenderingContext,
      source: string,
      type: number,
    ): WebGLShader | null {
      const shader = g.createShader(type);
      if (!shader) return null;
      g.shaderSource(shader, source);
      g.compileShader(shader);
      if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
        console.error("Shader compile error:", g.getShaderInfoLog(shader));
        g.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(
      g: WebGLRenderingContext,
      vs: WebGLShader,
      fs: WebGLShader,
    ): WebGLProgram | null {
      const program = g.createProgram();
      if (!program) return null;
      g.attachShader(program, vs);
      g.attachShader(program, fs);
      g.linkProgram(program);
      if (!g.getProgramParameter(program, g.LINK_STATUS)) {
        console.error("Program link error:", g.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    function getUniforms(
      g: WebGLRenderingContext,
      program: WebGLProgram,
    ): Record<string, WebGLUniformLocation | null> {
      const map: Record<string, WebGLUniformLocation | null> = {};
      const count = g.getProgramParameter(program, g.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = g.getActiveUniform(program, i);
        if (!info) continue;
        map[info.name] = g.getUniformLocation(program, info.name);
      }
      return map;
    }

    function initShader(): WebGLRenderingContext | null {
      const ctx =
        canvasEl!.getContext("webgl") ||
        (canvasEl!.getContext("experimental-webgl") as WebGLRenderingContext | null);
      if (!ctx) {
        console.error("WebGL não suportado.");
        return null;
      }

      const vertexShader = createShader(ctx, vsSource, ctx.VERTEX_SHADER);
      const fragmentShader = createShader(ctx, fsSource, ctx.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) return null;

      const program = createProgram(ctx, vertexShader, fragmentShader);
      if (!program) return null;

      uniforms = getUniforms(ctx, program);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

      ctx.useProgram(program);
      const positionLocation = ctx.getAttribLocation(program, "a_position");
      ctx.enableVertexAttribArray(positionLocation);
      ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);

      return ctx;
    }

    function resizeCanvas() {
      if (!gl || !canvasEl) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = window.innerWidth * dpr;
      canvasEl.height = window.innerHeight * dpr;
      if (uniforms.u_ratio) {
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
      }
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    function render() {
      if (!gl) return;
      const currentTime = performance.now();
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;
      gl.uniform1f(uniforms.u_time!, currentTime);
      gl.uniform2f(
        uniforms.u_pointer_position!,
        pointer.x / window.innerWidth,
        1 - pointer.y / window.innerHeight,
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }

    function setupEvents() {
      const updatePos = (x: number, y: number) => {
        pointer.tX = x;
        pointer.tY = y;
      };
      const pointermove = (e: PointerEvent) => updatePos(e.clientX, e.clientY);
      const touchmove = (e: TouchEvent) => {
        if (e.targetTouches[0])
          updatePos(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      };
      const click = (e: MouseEvent) => updatePos(e.clientX, e.clientY);

      window.addEventListener("pointermove", pointermove);
      window.addEventListener("touchmove", touchmove);
      window.addEventListener("click", click);

      return () => {
        window.removeEventListener("pointermove", pointermove);
        window.removeEventListener("touchmove", touchmove);
        window.removeEventListener("click", click);
      };
    }

    // Init
    gl = initShader();
    if (!gl) return;

    const cleanupEvents = setupEvents();
    resizeCanvas();

    const resizeListener = () => resizeCanvas();
    window.addEventListener("resize", resizeListener);

    gl.uniform3f(uniforms.u_color!, color[0], color[1], color[2]);
    gl.uniform1f(uniforms.u_speed!, speed);

    render();

    return () => {
      window.removeEventListener("resize", resizeListener);
      cleanupEvents();
      cancelAnimationFrame(rafId);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
    />
  );
}
