import React from "react";
import { ToDo } from "../bim-components/TodoCreator/src/ToDo";

interface Props {
  todo: ToDo;
  onDeleteClick: () => void;
}

const ToDoCard = ({ todo, onDeleteClick }: Props) => {
  const [status, setStatus] = React.useState(todo.getStatus());
  const symbols = {
    active: "check_box_outline_blank",
    completed: "check_box",
    overdue: "disabled_by_default",
  };
  const status_symbol = symbols[status];

  const onCheckboxClicked = () => {
    todo.toggleStatus(status);
    const updatedStatus = todo.getStatus();
    setStatus(updatedStatus);
  };

  return (
    <div className={`list-item todo-${status}`}>
      <p todo-list-functions="toggle-active" onClick={onCheckboxClicked}>
        <span className="material-symbols-outlined">{status_symbol}</span>
      </p>
      <p>{todo.task}</p>
      <p>{todo.deadline.toLocaleDateString()}</p>
      <p onClick={onDeleteClick}>
        <span className="material-symbols-outlined">delete</span>
      </p>
    </div>
  );
};

export default ToDoCard;
