import { useEffect, useRef } from "react";
import type { CanvasElement } from "../types";
import { CanvasElementStorage } from "../storage/canvas-element-storage";

export function useSyncLocalStorage(
  setState: (elements: CanvasElement[]) => void
) {
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      const storedElements = CanvasElementStorage.get();
      if (storedElements) {
        setState(storedElements);
      }
      firstLoad.current = false;
    }
  }, [setState]);

  return {
    syncLocalStorage: (elements: CanvasElement[]) => {
      CanvasElementStorage.set(elements);
    },
  };
}
