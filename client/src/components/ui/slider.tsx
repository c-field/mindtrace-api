import React, { useEffect } from "react";
import ReactSlider from "react-slider";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = ({
  value,
  onValueChange,
  min = 1,
  max = 10,
  step = 1,
  className = "",
}: Props) => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent iOS from hijacking drag
    };

    const slider = document.querySelector(".intensity-slider");
    if (slider) {
      slider.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      if (slider) {
        slider.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <ReactSlider
        className={cn("intensity-slider", className)}
        thumbClassName="react-slider_thumb"
        trackClassName="react-slider_track"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onValueChange}
        renderThumb={(props) => (
          <div {...props} role="slider" tabIndex={0} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} />
        )}
      />
    </div>
  );
};