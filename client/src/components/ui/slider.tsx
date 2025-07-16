// components/ui/slider.tsx
import React from "react";
import ReactSlider from "react-slider";
import { cn } from "@/lib/utils";

interface Props {
  value: number[];
  onValueChange: (val: number[]) => void;
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
  return (
    <ReactSlider
      className={cn("relative w-full h-2 bg-secondary rounded-full", className)}
      thumbClassName="h-6 w-6 rounded-full bg-primary border-2 border-white cursor-pointer touch-pan-x focus:outline-none focus:ring-2 focus:ring-ring -mt-2"
      trackClassName="bg-primary h-full rounded-full"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(val: number) => onValueChange([val])}
      renderThumb={(props, state) => <div {...props} />}
      style={{ touchAction: "pan-x", WebkitTapHighlightColor: "transparent" }}
    />
  );
};