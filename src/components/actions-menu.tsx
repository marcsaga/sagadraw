export type MenuAction = "rectangle" | "line" | "select";

interface ActionsMenuProps {
  action: MenuAction;
  selectAction: (action: MenuAction) => void;
  deleteAll: () => void;
}

const options: { label: string; action: MenuAction }[] = [
  { label: "Rectangle", action: "rectangle" },
  { label: "Line", action: "line" },
  { label: "Select", action: "select" },
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
          onClick={() => selectAction(option.action)}
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
