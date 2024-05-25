import React from "react";
import { ToDo, ToDoStatus } from "../classes/ToDo";
import { Project } from "../classes/Project";

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
    //bu kısıma odaklan, overdue task active olurken tarihi değişmelidir!!!!!!
    setTodoStatus(todo.getStatus());
  };

  return (
    <div className={`list-item todo-${todoStatus}`}>
      <p todo-list-functions="toggle-active">
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
      <p>
        {deadline instanceof Date
          ? deadline.toDateString()
          : new Date(deadline).toDateString()}
      </p>
    </div>
  );
};

export default ToDoCard;
