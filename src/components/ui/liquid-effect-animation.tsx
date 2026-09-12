"use client"

import { useEffect, useRef } from "react"

export function LiquidEffectAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Load the script dynamically
    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('https://cdn.21st.dev/assets/mirror/95/95e97d22cb2df434400243c60803fb89a5e25a46dad13c4a6d5cb27246173cf0.png');
        app.liquidPlane.material.metalness = 0.75;
        app.liquidPlane.material.roughness = 0.25;
        app.liquidPlane.uniforms.displacementScale.value = 5;
        app.setRain(false);
        window.__liquidApp = app;
      }
    `
    document.body.appendChild(script)

    return () => {
      if (window.__liquidApp && window.__liquidApp.dispose) {
        window.__liquidApp.dispose()
      }
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div
      className="absolute inset-0 m-0 w-full h-full touch-none overflow-hidden"
      style={{ fontFamily: '"Montserrat", serif' }}
    >
      <canvas ref={canvasRef} id="liquid-canvas" className="absolute inset-0 w-full h-full" />
    </div>
  )
}

declare global {
  interface Window {
    __liquidApp?: any
  }
}
