"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CameraIcon, FlipHorizontalIcon, ShieldIcon } from "lucide-react";
import type { CameraDirection } from "@/types";

export function CameraDialog({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageData: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraDirection, setCameraDirection] =
    useState<CameraDirection>("environment");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "prompt" | "granted" | "denied" | "unknown"
  >("unknown");

  useEffect(() => {
    if (open) {
      checkCameraPermission();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  useEffect(() => {
    // Start camera when permission is granted and camera direction changes
    if (open && permissionStatus === "granted") {
      startCamera();
    }
  }, [open, cameraDirection, permissionStatus]);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: "camera" });
        setPermissionStatus(result.state);
      } else {
        // If permissions API isn't available, assume we need to request
        setPermissionStatus("prompt");
      }
    } catch (error) {
      console.error("Error checking camera permission:", error);
      setPermissionStatus("prompt");
    }
  };

  const requestCameraPermission = async () => {
    try {
      await startCamera();
      setPermissionStatus("granted");
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setPermissionStatus("denied");
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraDirection },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      onCapture(imageData);
      onOpenChange(false);
    }
  };

  const toggleCamera = () => {
    setCameraDirection((prev) =>
      prev === "environment" ? "user" : "environment",
    );
  };

  const renderCameraContent = () => {
    if (permissionStatus === "denied") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="bg-destructive/10 p-4 rounded-full">
            <ShieldIcon className="size-12 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Camera access denied</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please allow camera access in your browser settings and try again.
            </p>
          </div>
        </div>
      );
    }

    if (permissionStatus === "prompt" || permissionStatus === "unknown") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <CameraIcon className="size-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Camera access required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Allow access to your camera to take a photo for your canvas.
            </p>
          </div>
          <Button onClick={requestCameraPermission} className="mt-4">
            Allow Camera Access
          </Button>
        </div>
      );
    }

    // Camera is granted
    return (
      <>
        <div className="relative w-full aspect-square sm:aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex w-full justify-between">
          <Button variant="outline" onClick={toggleCamera}>
            <FlipHorizontalIcon className="size-4" />
            Switch Camera
          </Button>

          <Button onClick={handleCapture} variant="default">
            <CameraIcon className="size-4" />
            Capture
          </Button>
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Camera</DialogTitle>
          <DialogDescription>
            Take a photo to add to your canvas
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {renderCameraContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
