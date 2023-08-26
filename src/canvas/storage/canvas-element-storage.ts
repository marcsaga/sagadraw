import type { CanvasElement } from "../types";

export class CanvasElementStorage {
  static set(state: CanvasElement[]) {
    try {
      window.localStorage.setItem("canvas-state", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to set canvas state in localStorage:", error);
    }
  }

  static get(): CanvasElement[] | undefined {
    const rawState = window.localStorage.getItem("canvas-state");
    if (!rawState) return;

    try {
      const state = JSON.parse(rawState) as CanvasElement[];
      if (
        Array.isArray(state) &&
        state.every((item) => typeof item === "object" && "type" in item)
      ) {
        return state;
      }
    } catch (error) {
      console.error("Failed to get canvas state from localStorage");
    }
  }

  static clear() {
    try {
      window.localStorage.removeItem("canvas-state");
    } catch (error) {
      console.error("Failed to clear canvas state from localStorage");
    }
  }
}
