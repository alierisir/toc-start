import React from "react";
import { IToDo, ToDo, ToDoStatus } from "../classes/ToDo";
import { Project } from "../classes/Project";
import ToDoCard from "./ToDoCard";

interface Props {
  project: Project;
}

const ToDoComponent = ({ project }: Props) => {
  const [todoList, setTodoList] = React.useState<ToDo[]>(project.todoList);
  project.onTodoCreated = (todo) => {
    setTodoList([...project.todoList]);
  };
  project.onTodoRemoved = () => {
    setTodoList([...project.todoList]);
  };

  React.useEffect(() => {
    console.log("ToDo List State Updated", todoList);
  }, [todoList]);

  const todoCards = todoList.map((todo) => {
    return <ToDoCard todo={todo} key={todo.taskId} project={project} />;
  });
  const onNewTodoClicked = () => {
    console.log("*opens new todo form*");
    const modal = document.getElementById(
      "new-todo-modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };

  const onFormCancel = () => {
    console.log("*closes new todo form*");
    const todoForm = document.getElementById(
      "new-todo-form"
    ) as HTMLFormElement;
    const modal = document.getElementById(
      "new-todo-modal"
    ) as HTMLDialogElement;
    todoForm.reset();
    modal.close();
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todoForm = document.getElementById(
      "new-todo-form"
    ) as HTMLFormElement;
    const formData = new FormData(todoForm);
    const todoData: IToDo = {
      task: formData.get("todo-task") as string,
      deadline: new Date(formData.get("todo-deadline") as string),
      status: formData.get("todo-status") as ToDoStatus,
    };
    try {
      project.newToDo(todoData);
      console.log(project);
      onFormCancel();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="dashboard-card">
      <dialog id="new-todo-modal">
        <form
          onSubmit={(e) => {
            onFormSubmit(e);
          }}
          id="new-todo-form"
          className="modal-container"
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">assignment_add</span>New
            ToDo
          </h2>
          <div className="project-properties">
            <label htmlFor="todo-task">
              <span className="material-symbols-outlined">assignment</span>Task
            </label>
            <textarea
              required={true}
              rows={5}
              cols={30}
              name="todo-task"
              id="todo-task"
              placeholder="Write the task to be done.(max. 270 characters)"
              maxLength={270}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="todo-status">
              <span className="material-symbols-outlined">assignment_late</span>
              Status
            </label>
            <select name="todo-status" id="todo-status">
              <option value="active" defaultValue={"active"}>
                Active
              </option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="todo-deadline">
              <span className="material-symbols-outlined">event</span>Deadline
            </label>
            <input id="todo-deadline" name="todo-deadline" type="date" />
          </div>
          <div className="button-section">
            <button
              onClick={onFormCancel}
              id="todo-cancel"
              type="button"
              className="cancel-btn"
            >
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>
              Accept
            </button>
          </div>
        </form>
      </dialog>
      <div className="todo-header">
        <h3>To-Do</h3>
        <div>
          <button project-info-btn="todo-search">
            <span className="material-symbols-outlined">search</span>
          </button>
          <input todo-search="" type="text" placeholder="Search task by name" />
          <button
            onClick={onNewTodoClicked}
            project-info-btn="todo-add"
            todo-add=""
          >
            <span className="material-symbols-outlined">playlist_add</span>
          </button>
        </div>
      </div>
      <div todo-list-container="" className="todo-list">
        {todoCards}
      </div>
    </div>
  );
};

export default ToDoComponent;
