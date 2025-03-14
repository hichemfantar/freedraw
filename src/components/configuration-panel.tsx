"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Colorful } from "@uiw/react-color";

/**
 * Configuration component for customizing drawing properties
 */
export function ConfigurationPanel({
  strokeColor,
  updateCanvasStrokeColor,
  bgColor,
  updateCanvasBg,
  strokeWidth,
  updateCanvasStrokeWidth,
}: {
  strokeColor: string;
  updateCanvasStrokeColor: (color: string) => void;
  bgColor: string;
  updateCanvasBg: (color: string) => void;
  strokeWidth: number;
  updateCanvasStrokeWidth: (width: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stroke color settings */}
      <div>
        <div className="text-xs mb-2">Stroke</div>
        <div className="flex gap-2 items-center">
          {/* Predefined color palette */}
          <div className="flex gap-1">
            {DEFAULT_COLORS.map((color) => (
              <TooltipProvider key={color}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => updateCanvasStrokeColor(color)}
                      className={cn(
                        "size-6 rounded transition border",
                        strokeColor === color
                          ? "bg-primary/20 border-2 border-black scale-110"
                          : "hover:bg-primary/10 hover:scale-110",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {/* Separator */}
          <div className="items-stretch h-4 w-0.5 bg-accent rounded-full"></div>

          {/* Custom stroke color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "size-7 rounded transition hover:scale-110 border data-[state=open]:scale-110",
                )}
                style={{ backgroundColor: strokeColor }}
              />
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={30}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Colorful
                    className="!w-full"
                    color={strokeColor}
                    onChange={(updatedColor) => {
                      updateCanvasStrokeColor(updatedColor.hexa);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-1 items-center gap-2">
                    <Label htmlFor="hex">Hex Code</Label>
                    <Input
                      id="hex"
                      value={strokeColor}
                      defaultValue={strokeColor}
                      className="col-span-2 h-8"
                      onChange={(e) => {
                        updateCanvasStrokeColor(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <PopoverArrow className="fill-black dark:invert" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <div className="text-xs mb-2">Background</div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {DEFAULT_COLORS.map((color) => (
              <TooltipProvider key={color}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        updateCanvasBg(color);
                      }}
                      className={cn(
                        "size-6 rounded transition border",
                        bgColor === color
                          ? "bg-primary/20 border-2 border-black scale-110"
                          : "hover:bg-primary/10 hover:scale-110",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="items-stretch h-4 w-0.5 bg-accent rounded-full"></div>

          {/* Custom bg color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "size-7 rounded transition hover:scale-110 border data-[state=open]:scale-110",
                )}
                style={{ backgroundColor: bgColor }}
              />
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={30}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Colorful
                    className="!w-full"
                    color={bgColor}
                    onChange={(updatedColor) => {
                      updateCanvasBg(updatedColor.hexa);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-1 items-center gap-2">
                    <Label htmlFor="hex">Hex Code</Label>
                    <Input
                      id="hex"
                      value={bgColor}
                      defaultValue={bgColor}
                      className="col-span-2 h-8"
                      onChange={(e) => {
                        updateCanvasBg(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <PopoverArrow className="fill-black dark:invert" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stroke width picker */}
      <div className="grid gap-2">
        <div className="grid grid-cols-1">
          <div className="text-xs mb-2">Stroke Width</div>
          <div className="flex gap-2">
            {[
              {
                value: 2,
                label: "Thin",
                icon: (
                  <div className="h-0.5 w-full bg-primary rounded-full"></div>
                ),
              },
              {
                value: 5,
                label: "Medium",
                icon: (
                  <div className="h-1 w-full bg-primary rounded-full"></div>
                ),
              },
              {
                value: 10,
                label: "Thick",
                icon: (
                  <div className="h-2 w-full bg-primary rounded-full"></div>
                ),
              },
            ].map((color) => (
              <TooltipProvider key={color.value}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => updateCanvasStrokeWidth(color.value)}
                      className={cn(
                        "size-16 rounded-md transition p-4",
                        strokeWidth === color.value
                          ? "bg-primary/20"
                          : "hover:scale-110 hover:bg-primary/10",
                      )}
                    >
                      {color.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
