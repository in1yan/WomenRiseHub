"use client"

import type React from "react"
import { forwardRef, useEffect, useRef, useState } from "react"

type MotionProps = Record<string, any>

function omitMotionProps(props: MotionProps) {
  const {
    initial,
    animate,
    exit,
    variants,
    whileHover,
    whileTap,
    transition,
    layout,
    layoutId,
    onAnimationStart,
    onAnimationComplete,
    ...rest
  } = props
  return rest
}

// Try to dynamically import framer-motion on the client.
// If it loads, use real motion; otherwise fall back to static elements.
function useRealMotion() {
  const [mod, setMod] = useState<any>(null)
  const triedRef = useRef(false)

  useEffect(() => {
    if (triedRef.current) return
    triedRef.current = true
    let mounted = true
    import("framer-motion")
      .then((m) => {
        if (mounted) setMod(m)
      })
      .catch(() => {
        // no-op fallback
      })
    return () => {
      mounted = false
    }
  }, [])

  return mod
}

// Create a dynamic proxy so motion.div / motion.button / motion.p, etc. work.
// If framer-motion is available, use it. Otherwise, render plain elements and strip motion props.
const cachedComponents = new Map<string, React.ComponentType<any>>()

function createMotionComponent(tag: string) {
  const Comp: any = tag

  const MotionComponent = forwardRef<any, MotionProps>(({ children, ...props }, ref) => {
    const real = useRealMotion()
    const RealTag = real?.motion?.[tag as keyof typeof real.motion]

    if (RealTag) {
      return (
        <RealTag ref={ref} {...props}>
          {children}
        </RealTag>
      )
    }

    const filteredProps = omitMotionProps(props)
    return (
      <Comp ref={ref} {...filteredProps}>
        {children}
      </Comp>
    )
  })

  MotionComponent.displayName = `Motion.${tag}`
  return MotionComponent
}

export const motion: any = new Proxy(
  {},
  {
    get(_target, tag: string) {
      if (!cachedComponents.has(tag)) {
        cachedComponents.set(tag, createMotionComponent(tag))
      }
      return cachedComponents.get(tag)
    },
  },
)

// AnimatePresence wrapper: prefer real one, fallback to fragment.
export const AnimatePresence = ({ children, ...rest }: { children: React.ReactNode } & Record<string, any>) => {
  const real = useRealMotion()
  const RealAP = real?.AnimatePresence
  if (RealAP) {
    return <RealAP {...rest}>{children}</RealAP>
  }
  return <>{children}</>
}
