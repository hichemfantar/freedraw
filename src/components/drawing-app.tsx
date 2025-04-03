"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserInterface } from "./user-interface";
import type { CameraDirection, Tool } from "@/types";
import {
  DEFAULT_DARK_MODE_BG_COLOR,
  DEFAULT_DARK_MODE_STROKE_COLOR,
  DEFAULT_LIGHT_MODE_BG_COLOR,
  DEFAULT_LIGHT_MODE_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_TOOL,
} from "@/constants";

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

    const now = new Date();

    // Format date as YYYY-MM-DD
    const date = now.toISOString().split("T")[0];

    // Format time as H.MM.SS AM/PM
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
    const time = `${hours}.${minutes}.${seconds} ${ampm}`;

    const filename = `Drawing ${date} at ${time}.png`;

    // Create download link and trigger download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const captureImage = async (direction: CameraDirection = "environment") => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access is not supported on this device.");
      return;
    }

    const capturePromise = () => {
      return new Promise<{ imageData: string }>((resolve, reject) => {
        // Request camera access
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: direction,
            },
          })
          .then((stream) => {
            // Create video element to display camera feed
            const video = document.createElement("video");
            video.srcObject = stream;
            video.play();

            // Take picture after a brief delay
            setTimeout(() => {
              try {
                // Create temporary canvas to capture the image
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  reject("Failed to get canvas context");
                  return;
                }

                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Stop camera stream
                stream.getTracks().forEach((track) => track.stop());

                // Return the image data
                const imageData = canvas.toDataURL("image/png");
                resolve({ imageData });
              } catch (error) {
                reject(error);
              }
            }, 1000);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    toast.promise(capturePromise, {
      loading: "Capturing image...",
      success: (data) => {
        // Apply captured image to main canvas
        applyImageToCanvas(data.imageData);
        return "Picture taken successfully";
      },
      error: "Failed to capture image",
    });
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
        applyImageToCanvas={applyImageToCanvas}
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
