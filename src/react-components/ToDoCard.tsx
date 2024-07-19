import React from "react";
import { ToDo } from "../bim-components/TodoCreator/src/ToDo";
import { updateDocument } from "../firebase";

interface Props {
  todo: ToDo;
  onDeleteClick?: () => void;
  onCardClick?: () => void;
}

const ToDoCard = ({ todo, onDeleteClick, onCardClick }: Props) => {
  const [status, setStatus] = React.useState(todo.getStatus());
  const [priority] = React.useState(todo.priority);
  const getFragmentQty = () => {
    let count = 0;
    for (const fragmentId in todo.fragmentMap) {
      const set = todo.fragmentMap[fragmentId];
      count += set.size;
    }
    return count;
  };

  const symbols = {
    active: "check_box_outline_blank",
    completed: "check_box",
    overdue: "disabled_by_default",
  };

  const status_symbol = symbols[status];

  const onCheckboxClicked = async () => {
    await todo.toggleStatus(status);
    const updatedStatus = todo.getStatus();
    setStatus(updatedStatus);
    await updateDocument("/todos", todo.taskId, { status: updatedStatus });
  };

  return (
    <div className={`todo-card todo-${status}-${todo.priority}`}>
      <p
        todo-list-functions="toggle-active"
        onClick={onCheckboxClicked}
        className="todo-checkbox"
      >
        <span className="material-symbols-outlined">{status_symbol}</span>
      </p>
      <div className="task-date-section">
        <p className="date">{todo.deadline.toLocaleDateString()}</p>
        <p className="task">{todo.task}</p>
      </div>
      <div className="todo-btn-section">
        <p onClick={onCardClick}>
          <span className="material-symbols-outlined">ads_click</span>
        </p>
        <p onClick={onDeleteClick}>
          <span className="material-symbols-outlined">delete</span>
        </p>
      </div>
    </div>
  );
};

export default ToDoCard;
