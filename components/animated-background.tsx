"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />

      {/* Animated shapes */}
      <div
        className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-30 blur-3xl"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          transition: "transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1)",
        }}
      />
      <div
        className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 opacity-30 blur-3xl"
        style={{
          transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
          transition: "transform 1s cubic-bezier(0.075, 0.82, 0.165, 1)",
        }}
      />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjMuNCAzLjIgMS4yLjkuOCAxLjMgMS44IDEuMyAzcy0uNCAxLjktMS4zIDIuN2MtLjkuOC0xLjkgMS4yLTMuMiAxLjJzLTIuMy0uNC0zLjItMS4yYy0uOS0uOC0xLjMtMS44LTEuMy0zcy40LTEuOSAxLjMtMi43Yy45LS44IDEuOS0xLjIgMy4yLTEuMnptLTEyIDBjMS4yIDAgMi4zLjQgMy4yIDEuMi45LjggMS4zIDEuOCAxLjMgM3MtLjQgMS45LTEuMyAyLjdjLS45LjgtMS45IDEuMi0zLjIgMS4ycy0yLjMtLjQtMy4yLTEuMmMtLjktLjgtMS4zLTEuOC0xLjMtM3MuNC0xLjkgMS4zLTIuN2MuOS0uOCAxLjktMS4yIDMuMi0xLjJ6bTI0IDBjMS4yIDAgMi4zLjQgMy4yIDEuMi45LjggMS4zIDEuOCAxLjMgM3MtLjQgMS45LTEuMyAyLjdjLS45LjgtMS45IDEuMi0zLjIgMS4ycy0yLjMtLjQtMy4yLTEuMmMtLjktLjgtMS4zLTEuOC0xLjMtM3MuNC0xLjkgMS4zLTIuN2MuOS0uOCAxLjktMS4yIDMuMi0xLjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
    </div>
  )
}
