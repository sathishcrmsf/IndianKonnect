"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselProps {
  children: React.ReactNode
  className?: string
}

export function Carousel({ children, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true)

  const onSelect = React.useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

