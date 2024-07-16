import React from "react";
import * as Firestore from "firebase/firestore";
import ToDoCard from "./ToDoCard";
import { Project } from "../classes/Project";
import * as CF from "../classes/CustomFunctions";
import SearchBox from "./SearchBox";
import { ViewerContext } from "./IFCViewer";
import { TodoCreator } from "../bim-components/TodoCreator";
import { IToDo, ToDo, ToDoStatus } from "../bim-components/TodoCreator/src/ToDo";
import { deleteDocument, getCollection } from "../firebase";

interface Props {
  project: Project;
}

const ToDoContainer = ({ project }: Props) => {
  const [list, setList] = React.useState(project.getToDoList());

  const { viewer } = React.useContext(ViewerContext);
  if (!viewer) return <>Viewer component couldn't be found!</>;

  let todoCreator: TodoCreator;

  const setupTodoCreator = async () => {
    todoCreator = await viewer.tools.get(TodoCreator);
  };

  setupTodoCreator();
  const todosCollection = getCollection<IToDo>("/todos");

  project.onToDoDeleted = async (id) => {
    await deleteDocument("/todos", id);
  };

  project.onToDoListUpdate = () => {
    setList([...project.getToDoList()]);
  };

  const todoList = list.map((todo) => (
    <ToDoCard
      key={todo.taskId}
      todo={todo}
      onDeleteClick={() => {
        todo.dispose();
      }}
      onCardClick={() => {
        todo.card.get().click();
      }}
    />
  ));

  const onNewTodoClick = () => {
    const modal = document.getElementById("new-todo-modal") as HTMLDialogElement;
    modal.showModal();
  };

  const onCancelClick = () => {
    const modal = document.getElementById("new-todo-modal") as HTMLDialogElement;
    modal.close();
    const form = document.getElementById("new-todo-form") as HTMLFormElement;
    form.reset();
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById("new-todo-form") as HTMLFormElement;
    const formData = new FormData(form);
    const deadline =
      new Date(formData.get("todo-deadline") as string).toDateString() === "Invalid Date"
        ? CF.monthsAfterToday(1)
        : new Date(formData.get("todo-deadline") as string);
    const data: IToDo = {
      task: formData.get("todo-task") as string,
      deadline,
      status: formData.get("todo-status") as ToDoStatus,
      projectId: project.id,
    };
    try {
      const doc = await Firestore.addDoc(todosCollection, data);
      todoCreator.addTodo(data, doc.id);
      onCancelClick();
    } catch (error) {
      console.log(error);
    }
  };

  project.onToDoListFiltered = (filtered) => {
    setList([...filtered]);
  };

  return (
    <div className="dashboard-card">
      <dialog id="new-todo-modal">
        <form
          id="new-todo-form"
          className="modal-container"
          onSubmit={(e) => {
            onFormSubmit(e);
          }}
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">assignment_add</span>New ToDo
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
              <option value="active" defaultValue="active">
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
            <button id="todo-cancel" type="button" className="cancel-btn" onClick={onCancelClick}>
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
          <SearchBox items="tasks" onChange={(value) => project.filterToDoList(value)} />
          <button project-info-btn="todo-add" todo-add="" onClick={onNewTodoClick}>
            <span className="material-symbols-outlined">playlist_add</span>
          </button>
        </div>
      </div>
      <div todo-list-container="" className="todo-list">
        {todoList.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>There is nothing to do</p>
        ) : (
          todoList
        )}
      </div>
    </div>
  );
};

export default ToDoContainer;
