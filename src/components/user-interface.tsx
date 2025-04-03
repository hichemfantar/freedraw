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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";
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
import Link from "next/link";
import { useState } from "react";
import { CameraDialog } from "./camera-dialog";
import { ConfigurationPanel } from "./configuration-panel";

export function UserInterface({
  isDrawing,
  isUiHidden,
  toggleUiVisibility,
  saveImage,
  copyImage,
  clearCanvas,
  updateCanvasTool,
  tool,
  strokeColor,
  updateCanvasStrokeColor,
  bgColor,
  updateCanvasBg,
  strokeWidth,
  updateCanvasStrokeWidth,
  applyImageToCanvas,
}: {
  isDrawing: boolean;
  isUiHidden: boolean;
  toggleUiVisibility: () => void;
  saveImage: () => void;
  copyImage: () => void;
  clearCanvas: () => void;
  updateCanvasTool: (tool: Tool) => void;
  tool: Tool;
  strokeColor: string;
  updateCanvasStrokeColor: (color: string) => void;
  bgColor: string;
  updateCanvasBg: (color: string) => void;
  strokeWidth: number;
  updateCanvasStrokeWidth: (width: number) => void;
  applyImageToCanvas: (imageData: string) => void;
}) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleCameraCapture = (imageData: string) => {
    applyImageToCanvas(imageData);
  };

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
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCameraOpen(true)}
                      className={cn(
                        "p-2.5 rounded-md transition hover:bg-primary/10",
                      )}
                    >
                      <CameraIcon className="size-4" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Take Photo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <CameraDialog
                open={cameraOpen}
                onOpenChange={setCameraOpen}
                onCapture={handleCameraCapture}
              />
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
