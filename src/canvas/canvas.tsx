import { ActionsMenu } from "~/components/actions-menu";
import { useCanvas } from "./use-canvas";

export const Canvas = () => {
  const { canvasRef, startDrawing, draw, endDrawing, selectAction } =
    useCanvas();

  return (
    <div className="rootContainer">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
      ></canvas>
      <ActionsMenu selectAction={selectAction} />
    </div>
  );
};
