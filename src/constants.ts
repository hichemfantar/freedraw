import type { Tool } from "./types";

// Default color palette for the application
export const DEFAULT_COLORS = [
  "#1e1e1e", // Black
  "#e03130", // Red
  "#2f9e44", // Green
  "#1971c2", // Blue
  "#f08c02", // Orange
] as const;

// Default background colors based on theme
export const DEFAULT_LIGHT_MODE_BG_COLOR = "#ffffff";
export const DEFAULT_DARK_MODE_BG_COLOR = "#1e1e1e";

// Default stroke colors based on theme
export const DEFAULT_LIGHT_MODE_STROKE_COLOR = "#000000";
export const DEFAULT_DARK_MODE_STROKE_COLOR = "#fefefe";

// Default stroke width and tool
export const DEFAULT_STROKE_WIDTH = 5;
export const DEFAULT_TOOL: Tool = "pencil";
