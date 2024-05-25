import React from "react";
import { ToDo, ToDoStatus } from "../classes/ToDo";
import { Project } from "../classes/Project";
import { monthsAfterToday } from "../classes/CustomFunctions";

interface Props {
  project: Project;
  todo: ToDo;
}

const ToDoCard = ({ todo, project }: Props) => {
  const { task, status, deadline } = todo;
  const symbols = {
    active: "check_box_outline_blank",
    completed: "check_box",
    overdue: "disabled_by_default",
  };
  const [todoStatus, setTodoStatus] = React.useState<ToDoStatus>(status);

  const onCheckClicked = () => {
    if (todoStatus === "active") {
      project.changeToCompleted(todo.taskId);
    } else {
      project.changeToActive(todo.taskId);
    }
    setTodoStatus(todo.getStatus());
  };

  const onDelayClicked = () => {
    project.changeToActive(todo.taskId);
    todo.setDeadline(monthsAfterToday(1));
    setTodoStatus(todo.getStatus());
  };

  const onDeleteClicked = () => {
    project.removeToDo(todo.taskId);
  };

  return (
    <div className={`list-item todo-${todoStatus}`}>
      <p
        todo-list-functions="toggle-active"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span
          className="material-symbols-outlined"
          onClick={onCheckClicked}
          hidden={todoStatus === "overdue" ? true : false}
        >
          {symbols[todoStatus]}
        </span>
        <span
          className="material-symbols-outlined"
          hidden={todoStatus === "overdue" ? false : true}
          onClick={onDelayClicked}
        >
          more_time
        </span>
      </p>
      <p>{task}</p>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          columnGap: "5px",
          fontSize: ".6rem",
        }}
      >
        {deadline instanceof Date
          ? deadline.toDateString()
          : new Date(deadline).toDateString()}
        <span className="material-symbols-outlined" onClick={onDeleteClicked}>
          delete
        </span>
      </p>
    </div>
  );
};

export default ToDoCard;
