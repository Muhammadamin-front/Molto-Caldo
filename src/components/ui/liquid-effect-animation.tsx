"use client"

import { useEffect, useRef } from "react"

/**
 * WebGL suyuqlik foni. Uch holatda umuman ishga tushmaydi — va bu xato emas,
 * chunki `FinalCta` bo'limida qattiq qorong'i fon bor:
 *   - brauzer WebGL bera olmasa (eski telefon, apparat tezlashtirish o'chiq):
 *     ilgari bu yerda `Error creating WebGL context` tutilmay qolardi;
 *   - foydalanuvchi `prefers-reduced-motion` yoqqan bo'lsa — boshqa
 *     animatsiyalar ham shunga bo'ysunadi, bu esa doim harakatda edi;
 *   - skript yuklanmasa yoki ichida xato chiqsa.
 */
function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    if (!gl) return false
    // Sinov konteksti brauzerning WebGL kontekst limitidan joy olmasin.
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}

export function LiquidEffectAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!supportsWebGL()) return

    // Load the script dynamically
    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      try {
        const { default: LiquidBackground } = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js');

        const canvas = document.getElementById('liquid-canvas');
        if (canvas) {
          const app = LiquidBackground(canvas);
          app.loadImage('/textures/liquid.png');
          app.liquidPlane.material.metalness = 0.75;
          app.liquidPlane.material.roughness = 0.25;
          app.liquidPlane.uniforms.displacementScale.value = 5;
          app.setRain(false);
          window.__liquidApp = app;
        }
      } catch (error) {
        // Fon — bezak. Yiqilsa bo'lim qorong'i fonda qoladi, sahifa ishlaydi.
        console.info('[liquid] effect skipped:', error && error.message);
      }
    `
    document.body.appendChild(script)

    return () => {
      window.__liquidApp?.dispose?.()
      window.__liquidApp = undefined
      script.remove()
    }
  }, [])

  return (
    <div className="absolute inset-0 m-0 h-full w-full touch-none overflow-hidden">
      <canvas ref={canvasRef} id="liquid-canvas" className="absolute inset-0 h-full w-full" />
    </div>
  )
}

declare global {
  interface LiquidBackgroundApp {
    dispose?: () => void
  }

  interface Window {
    __liquidApp?: LiquidBackgroundApp
  }
}
