"use client";

import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SliderStyle = CSSProperties & {
  "--slider-duration": string;
  "--slider-hover-duration": string;
};

type InfiniteSliderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  speed?: number;
  speedOnHover?: number;
};

function durationFromSpeed(speed: number) {
  return `${Math.max(8, 1200 / Math.max(1, speed))}s`;
}

export function InfiniteSlider({
  children,
  className,
  direction = "horizontal",
  speed = 40,
  speedOnHover = speed,
  ...props
}: InfiniteSliderProps) {
  const items = Children.toArray(children);
  const style: SliderStyle = {
    "--slider-duration": durationFromSpeed(speed),
    "--slider-hover-duration": durationFromSpeed(speedOnHover),
  };

  return (
    <div
      className={cn("infinite-slider overflow-hidden", className)}
      data-direction={direction}
      style={style}
      {...props}
    >
      <div className="infinite-slider-track">
        <div className="infinite-slider-group">{items}</div>
        <div className="infinite-slider-group" aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  );
}

export default InfiniteSlider;
