import React from "react";
import { Project } from "../classes/Project";
import { correctDate } from "../classes/CustomFunctions";
import { IToDo, ToDo } from "../classes/ToDo";
import { updateCollection } from "../firebase";

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

  const onCheckboxClicked = async () => {
    todo.toggleStatus(status);
    const updatedStatus = todo.getStatus();
    setStatus(updatedStatus);
    const data = {
      status: todo.getStatus(),
      deadline: todo.deadline,
    };
    await updateCollection<Partial<IToDo>>("todos", todo.taskId, data);
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
