"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Colorful } from "@uiw/react-color";
import {
  CameraIcon,
  CopyIcon,
  DownloadIcon,
  EraserIcon,
  EyeIcon,
  EyeOffIcon,
  GithubIcon,
  PencilIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Define the available drawing tool types
type Tool = "pencil" | "eraser";
// Define the available camera direction options
type CameraDirection = "user" | "environment";

// Default color palette for the application
const DEFAULT_COLORS = [
  "#1e1e1e", // Black
  "#e03130", // Red
  "#2f9e44", // Green
  "#1971c2", // Blue
  "#f08c02", // Orange
] as const;

// Default background colors based on theme
const DEFAULT_LIGHT_MODE_BG_COLOR = "#ffffff";
const DEFAULT_DARK_MODE_BG_COLOR = "#1e1e1e";

// Default stroke colors based on theme
const DEFAULT_LIGHT_MODE_STROKE_COLOR = "#000000";
const DEFAULT_DARK_MODE_STROKE_COLOR = "#fefefe";

// Default stroke width and tool
const DEFAULT_STROKE_WIDTH = 5;
const DEFAULT_TOOL: Tool = "pencil";

/**
 * Initialize the drawing app with theme-based defaults
 * This component determines the initial state based on the current theme
 */
export default function Init() {
  // Get the current theme to set appropriate default colors
  const { theme } = useTheme();
  // Set stroke color based on theme (dark text on light bg, light text on dark bg)
  const strokeColor =
    theme === "light"
      ? DEFAULT_LIGHT_MODE_STROKE_COLOR
      : DEFAULT_DARK_MODE_STROKE_COLOR;
  // Set background color based on theme
  const bgColor =
    theme === "light"
      ? DEFAULT_LIGHT_MODE_BG_COLOR
      : DEFAULT_DARK_MODE_BG_COLOR;
  // Set default tool and stroke width
  const tool = DEFAULT_TOOL;
  const strokeWidth = DEFAULT_STROKE_WIDTH;

  // Render the drawing app with the determined defaults
  return (
    <DrawingApp
      defaultStrokeColor={strokeColor}
      defaultBgColor={bgColor}
      defaultTool={tool}
      defaultStrokeWidth={strokeWidth}
    />
  );
}

/**
 * Main DrawingApp component that handles the canvas and drawing functionality
 */
function DrawingApp({
  defaultStrokeColor,
  defaultBgColor,
  defaultTool,
  defaultStrokeWidth,
}: {
  defaultStrokeColor: string;
  defaultBgColor: string;
  defaultTool: Tool;
  defaultStrokeWidth: number;
}) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Reference to the 2D rendering context
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // State for drawing properties
  const [bgColor, setBgColor] = useState<string>(defaultBgColor);
  const [strokeColor, setStrokeColor] = useState<string>(defaultStrokeColor);
  const [tool, setTool] = useState<Tool>(defaultTool);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokeWidth, setStrokeWidth] = useState<number>(defaultStrokeWidth);
  const [isUiHidden, setIsUiHidden] = useState(false);

  // Reference to store the canvas state for resizing operations
  const canvasStateRef = useRef<ImageData | null>(null);

  // Refs to track current state values (used in resize handler to avoid closure issues)
  const currentToolRef = useRef(tool);
  const currentStrokeColorRef = useRef(strokeColor);
  const currentStrokeWidthRef = useRef(strokeWidth);
  const currentBgColorRef = useRef(bgColor);

  // Keep refs in sync with state values
  useEffect(() => {
    currentToolRef.current = tool;
    currentStrokeColorRef.current = strokeColor;
    currentStrokeWidthRef.current = strokeWidth;
    currentBgColorRef.current = bgColor;
  }, [bgColor, strokeColor, strokeWidth, tool]);

  // Initialize canvas on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match its display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Get and configure the 2D rendering context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial stroke style based on selected tool
    ctx.strokeStyle =
      currentToolRef.current === "eraser"
        ? currentBgColorRef.current
        : currentStrokeColorRef.current;
    ctx.lineWidth = currentStrokeWidthRef.current;
    // Set line style for smooth drawing
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // Fill canvas with background color
    ctx.fillStyle = currentBgColorRef.current;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Update context settings when tool, color, or width changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Set stroke style based on current tool (eraser uses background color)
    ctx.strokeStyle = tool === "eraser" ? bgColor : strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [bgColor, strokeColor, strokeWidth, tool]);

  /**
   * Handle canvas resizing while preserving drawing content
   * Uses a callback to prevent dependency issues in the resize observer
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Save current canvas state before resizing
    canvasStateRef.current = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Store original dimensions
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    // Update canvas dimensions to match current display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Reset context properties which get cleared on canvas resize
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Use refs instead of state to avoid closure issues
    const tool = currentToolRef.current;
    const bgColor = currentBgColorRef.current;
    const strokeColor = currentStrokeColorRef.current;
    const strokeWidth = currentStrokeWidthRef.current;

    // Restore context settings
    ctx.strokeStyle = tool === "eraser" ? bgColor : strokeColor;
    ctx.lineWidth = strokeWidth;

    // Fill with background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore previous canvas state, centered in the new dimensions
    if (canvasStateRef.current) {
      ctx.putImageData(
        canvasStateRef.current,
        Math.max(0, (canvas.width - oldWidth) / 2),
        Math.max(0, (canvas.height - oldHeight) / 2),
      );
    }
  }, []);

  // Set up resize observer to handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create and attach resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Cleanup on component unmount
    return () => {
      if (canvas) {
        resizeObserver.unobserve(canvas);
      } else {
        resizeObserver.disconnect();
      }
    };
  }, [handleResize]);

  /**
   * Update the canvas background color
   * @param color - New background color value
   */
  function updateCanvasBg(color: string) {
    setBgColor(color);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Update stroke style if using eraser
    ctx.strokeStyle = tool === "eraser" ? color : strokeColor;
    // Fill canvas with new background color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Update the stroke color
   * @param color - New stroke color value
   */
  function updateCanvasStrokeColor(color: string) {
    setStrokeColor(color);
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Set stroke style based on current tool
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
  }

  /**
   * Update the stroke width
   * @param width - New stroke width value
   */
  function updateCanvasStrokeWidth(width: number) {
    setStrokeWidth(width);
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineWidth = width;
  }

  /**
   * Apply an image to the canvas (used for camera capture)
   * @param image - Image data URL to apply to canvas
   */
  function applyImageToCanvas(image: string) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Create and load the image
    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scaling factor to cover the entire canvas
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height,
      );

      // Calculate centered position
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      // Draw the image with appropriate scaling and position
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height, // Source rectangle
        x,
        y,
        img.width * scale,
        img.height * scale, // Destination rectangle
      );
    };
  }

  /**
   * Update the current drawing tool
   * @param tool - New tool to use (pencil or eraser)
   */
  function updateCanvasTool(tool: Tool) {
    setTool(tool);
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Update stroke style based on tool
    ctx.strokeStyle = tool === "eraser" ? bgColor : strokeColor;
  }

  /**
   * Get drawing coordinates from mouse or touch event
   * @param e - Mouse or touch event
   * @returns Object with offsetX and offsetY coordinates
   */
  const getCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    // Handle touch events
    if ("touches" in e) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    }

    // Handle mouse events
    const rect = canvas.getBoundingClientRect();
    return { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  /**
   * Start drawing at the current position
   * @param e - Mouse or touch event
   */
  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const { offsetX, offsetY } = getCoordinates(e);
    if (!ctxRef.current) return;

    // Begin a new path and draw a point at the starting position
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    setIsDrawing(true);
  };

  /**
   * Continue drawing as pointer moves
   * @param e - Mouse or touch event
   */
  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const { offsetX, offsetY } = getCoordinates(e);
    if (!isDrawing || !ctxRef.current) return;

    // Draw a line to the current position
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  /**
   * Stop drawing when pointer is released or leaves canvas
   */
  const stopDrawing = () => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  /**
   * Save the canvas as a PNG image
   */
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link and trigger download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "drawing.png";
    link.click();
    toast.success("Image saved.");
  };

  /**
   * Copy the canvas content to clipboard
   */
  const copyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob and copy to clipboard
    canvas.toBlob((blob) => {
      if (!blob) return;
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      toast.success("Canvas copied to clipboard.");
    });
  };

  /**
   * Clear the canvas by filling it with the background color
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Fill canvas with background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Canvas cleared.");
  };

  /**
   * Toggle the visibility of the UI elements
   */
  const toggleUiVisibility = () => {
    setIsUiHidden((prev) => !prev);
  };

  /**
   * Capture an image using the device camera
   * @param direction - Camera direction (front or back)
   */
  const captureImage = async (direction: CameraDirection = "environment") => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access is not supported on this device.");
      return;
    }

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: direction,
      },
    });

    // Create video element to display camera feed
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Take picture after a brief delay
    setTimeout(() => {
      // Create temporary canvas to capture the image
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Stop camera stream
      stream.getTracks().forEach((track) => track.stop());
      toast.success("Picture taken.");

      // Apply captured image to main canvas
      applyImageToCanvas(canvas.toDataURL("image/png"));
    }, 1000);
  };

  return (
    <div className="relative w-full h-dvh">
      {/* Canvas element for drawing */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={cn(
          "block absolute top-0 left-0 w-full h-full object-contain",
          tool === "eraser" ? "cursor-not-allowed" : "cursor-crosshair",
        )}
      />

      {/* UI controls for drawing settings and actions */}
      <UserInterface
        isDrawing={isDrawing}
        isUiHidden={isUiHidden}
        toggleUiVisibility={toggleUiVisibility}
        saveImage={saveImage}
        copyImage={copyImage}
        clearCanvas={clearCanvas}
        captureImage={captureImage}
        updateCanvasTool={updateCanvasTool}
        tool={tool}
        strokeColor={strokeColor}
        updateCanvasStrokeColor={updateCanvasStrokeColor}
        bgColor={bgColor}
        updateCanvasBg={updateCanvasBg}
        strokeWidth={strokeWidth}
        updateCanvasStrokeWidth={updateCanvasStrokeWidth}
      />
    </div>
  );
}

/**
 * Configuration component for customizing drawing properties
 */
function ConfigurationPanel({
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

function UserInterface({
  isDrawing,
  isUiHidden,
  toggleUiVisibility,
  saveImage,
  copyImage,
  clearCanvas,
  captureImage,
  updateCanvasTool,
  tool,
  strokeColor,
  updateCanvasStrokeColor,
  bgColor,
  updateCanvasBg,
  strokeWidth,
  updateCanvasStrokeWidth,
}: {
  isDrawing: boolean;
  isUiHidden: boolean;
  toggleUiVisibility: () => void;
  saveImage: () => void;
  copyImage: () => void;
  clearCanvas: () => void;
  captureImage: (direction: CameraDirection) => void;
  updateCanvasTool: (tool: Tool) => void;
  tool: Tool;
  strokeColor: string;
  updateCanvasStrokeColor: (color: string) => void;
  bgColor: string;
  updateCanvasBg: (color: string) => void;
  strokeWidth: number;
  updateCanvasStrokeWidth: (width: number) => void;
}) {
  return (
    <div
      className={cn("absolute top-0 w-full p-4 pointer-events-none space-y-6")}
    >
      {/* Top toolbar with main controls */}
      <div className="flex flex-wrap gap-2 md:grid md:grid-cols-3">
        {/* Left section: UI toggle, avatar, and file operations */}
        <div className="flex items-center gap-4">
          {/* UI visibility toggle button */}
          <div
            className={cn(
              "transition-all",
              isDrawing
                ? "pointer-events-none invisible opacity-0"
                : "pointer-events-auto",
            )}
          >
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleUiVisibility}
                    size={"icon"}
                    variant={"outline"}
                    className=""
                  >
                    {isUiHidden ? (
                      <EyeOffIcon className="size-4" strokeWidth={1.5} />
                    ) : (
                      <EyeIcon className="size-4" strokeWidth={1.5} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isUiHidden ? "Show UI" : "Hide UI"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Creator avatar (desktop only) */}
          <Avatar
            className={cn(
              "hidden md:block shadow-lg border transition-all",
              isDrawing
                ? "pointer-events-none invisible opacity-0"
                : "pointer-events-auto",
              isUiHidden && "invisible opacity-0",
            )}
          >
            <AvatarImage
              src="https://github.com/hichemfantar.png"
              alt="@hichemfantar"
            />
            <AvatarFallback>HF</AvatarFallback>
          </Avatar>

          {/* File operations card */}
          <Card
            className={cn(
              "p-1 rounded-lg shadow-lg gap-1 transition-all pointer-events-auto",
              isDrawing && "pointer-events-none invisible opacity-0",
              isUiHidden && "invisible opacity-0",
            )}
          >
            {/* Save image button */}
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={saveImage}
                    className={cn(
                      "p-2.5 rounded-md transition hover:bg-primary/10",
                    )}
                  >
                    <DownloadIcon className="size-4" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save as image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Copy image button (desktop only) */}
            <div className="hidden md:inline-block">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyImage}
                      className={cn(
                        "p-2.5 rounded-md transition hover:bg-primary/10",
                      )}
                    >
                      <CopyIcon className="size-4" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Canvas to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Clear canvas button */}
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={clearCanvas}
                    className={cn(
                      "p-2.5 rounded-md transition hover:bg-primary/10",
                    )}
                  >
                    <Trash2Icon className="size-4" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Canvas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Camera button (mobile only) */}
            <div className="md:hidden inline-block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "p-2.5 rounded-md transition hover:bg-primary/10",
                    )}
                  >
                    <CameraIcon className="size-4" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => captureImage("environment")}>
                    Back Camera
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => captureImage("user")}>
                    Front Camera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        </div>

        {/* Center section: Drawing tools */}
        <Card
          className={cn(
            "p-1 rounded-lg shadow-lg transition-all flex gap-1 mx-auto pointer-events-auto",
            isDrawing && "pointer-events-none invisible opacity-0",
            isUiHidden && "invisible opacity-0",
          )}
        >
          {/* Pencil tool button */}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => updateCanvasTool("pencil")}
                  className={cn(
                    "p-2.5 rounded-md transition",
                    tool === "pencil" ? "bg-primary/20" : "hover:bg-primary/10",
                  )}
                >
                  <PencilIcon className="size-4" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pencil</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Eraser tool button */}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    updateCanvasTool("eraser");
                  }}
                  className={cn(
                    "p-2.5 rounded-lg transition",
                    tool === "eraser" ? "bg-primary/20" : "hover:bg-primary/10",
                  )}
                >
                  <EraserIcon className="size-4" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Card>

        {/* Right section: Theme toggle, GitHub link, and settings */}
        <div className={cn("flex justify-end self-center gap-2")}>
          {/* Theme toggle button (desktop only) */}
          <div
            className={cn(
              "hidden md:flex transition-all pointer-events-auto",
              isDrawing && "pointer-events-none invisible opacity-0",
              isUiHidden && "invisible opacity-0",
            )}
          >
            <ThemeToggle />
          </div>

          {/* GitHub link button (desktop only) */}
          <Button
            size={"icon"}
            variant={"outline"}
            className={cn(
              "hidden md:inline-flex transition-all pointer-events-auto",
              isDrawing && "pointer-events-none invisible opacity-0",
              isUiHidden && "invisible opacity-0",
            )}
            asChild
          >
            <Link
              href="https://github.com/hichemfantar/freedraw"
              target="_blank"
            >
              <GithubIcon />
            </Link>
          </Button>

          {/* Settings drawer (mobile only) */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className={cn(
                  "md:hidden pointer-events-auto transition-all",
                  isDrawing && "pointer-events-none invisible opacity-0",
                  isUiHidden && "invisible opacity-0",
                )}
              >
                <Settings2Icon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
                <DrawerDescription>
                  Customize your experience.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <ConfigurationPanel
                  strokeColor={strokeColor}
                  updateCanvasStrokeColor={updateCanvasStrokeColor}
                  bgColor={bgColor}
                  updateCanvasBg={updateCanvasBg}
                  strokeWidth={strokeWidth}
                  updateCanvasStrokeWidth={updateCanvasStrokeWidth}
                />
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Configuration panel (desktop only) */}
      <div className="hidden md:flex">
        <Card
          className={cn(
            "p-4 rounded-lg flex shadow-lg flex-col space-y-6 transition-all pointer-events-auto",
            isDrawing && "pointer-events-none invisible opacity-0",
            isUiHidden && "invisible opacity-0",
          )}
        >
          <ConfigurationPanel
            strokeColor={strokeColor}
            updateCanvasStrokeColor={updateCanvasStrokeColor}
            bgColor={bgColor}
            updateCanvasBg={updateCanvasBg}
            strokeWidth={strokeWidth}
            updateCanvasStrokeWidth={updateCanvasStrokeWidth}
          />
        </Card>
      </div>
    </div>
  );
}
