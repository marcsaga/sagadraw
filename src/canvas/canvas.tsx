import { ActionsMenu } from "~/components/actions-menu";
import { useCanvas } from "./use-canvas";

export const Canvas = () => {
  const { canvasRef, startDrawing, draw, endDrawing, selectAction, deleteAll } =
    useCanvas();

  return (
    <div>
      <canvas
        id="canvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
      ></canvas>
      <ActionsMenu selectAction={selectAction} deleteAll={deleteAll} />
    </div>
  );
};
