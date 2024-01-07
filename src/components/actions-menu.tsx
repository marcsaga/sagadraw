import type { Position } from "~/canvas/types";

export type MenuAction = "rectangle" | "line" | "select" | "text" | "arrow";

interface ActionsMenuProps {
  action: MenuAction;
  selectAction: (action: MenuAction, position: Position) => void;
  deleteAll: () => void;
}

const options: { label: string; action: MenuAction }[] = [
  { label: "Rectangle", action: "rectangle" },
  { label: "Line", action: "line" },
  { label: "Arrow", action: "arrow" },
  { label: "Select", action: "select" },
  { label: "Text", action: "text" },
];

export function ActionsMenu({
  selectAction,
  deleteAll,
  action,
}: ActionsMenuProps) {
  return (
    <div className="absolute bottom-24 right-24 flex gap-4" id="actions-menu">
      {options.map((option) => (
        <button
          key={option.action}
          id={option.action}
          className="rounded bg-black p-2"
          style={{
            backgroundColor: option.action === action ? "black" : "white",
            border:
              option.action === action ? "1px solid while" : "1px solid black",
            color: option.action === action ? "white" : "black",
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            selectAction(option.action, { x: event.clientX, y: event.clientY });
          }}
        >
          <span>{option.label}</span>
        </button>
      ))}
      <button
        className="rounded bg-red-600 p-2 text-white"
        onClick={deleteAll}
        id={`actions-menu-delete-all`}
      >
        <span>Delete all</span>
      </button>
    </div>
  );
}
