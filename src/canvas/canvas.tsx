import { ActionsMenu } from "~/components/actions-menu";
import { useCanvas } from "./hooks/use-canvas";

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
        title="interactive_canvas"
      ></canvas>
      <ActionsMenu selectAction={selectAction} deleteAll={deleteAll} />
    </div>
  );
};
