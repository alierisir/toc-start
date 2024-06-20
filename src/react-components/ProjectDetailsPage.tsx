import * as React from "react";
import * as Router from "react-router-dom";
import { ProjectsManager } from "../classes/ProjectsManager";
import DetailsCard from "./DetailsCard";
import DetailsHeader from "./DetailsHeader";
import IFCViewer, { ViewerContext } from "./IFCViewer";
import ToDoCard from "./ToDoCard";
import { Project } from "../classes/Project";
import { IToDo, ToDoStatus } from "../classes/ToDo";
import * as CF from "../classes/CustomFunctions";
import SearchBox from "./SearchBox";
import { TodoCreator } from "../bim-components/TodoCreator";
import { ToDo } from "../bim-components/TodoCreator/src/ToDo";

interface Props {
  projectsManager: ProjectsManager;
}

const ProjectDetailsPage = ({ projectsManager }: Props) => {
  const routeParams = Router.useParams<{ id: string }>();
  if (!routeParams.id) return <>ID is invalid</>;
  const project = projectsManager.getProject(routeParams.id);
  if (!project) return <>Project is not found!</>;
  const { viewer } = React.useContext(ViewerContext);
  //details page todocontainer start
  const addTodo = async (data: IToDo) => {
    if (!viewer) return;
    const todoCreator = await viewer.tools.get(TodoCreator);
    const todo = await todoCreator.addTodo(project.id, "Normal");
    console.log(todo);
  };

  const [list, setList] = React.useState(project.getToDoList());

  project.onNewTodo = (todo) => {
    console.log(todo);
    setList([...project.getToDoList()]);
  };

  const onDeleteTodo = (id: string) => {
    project.removeToDo(id);
    setList([...project.getToDoList()]);
  };

  const todoList = list.map((todo) => (
    <ToDoCard
      key={todo.taskId}
      todo={todo}
      onDeleteClick={() => {
        onDeleteTodo(todo.taskId);
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

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById("new-todo-form") as HTMLFormElement;
    const formData = new FormData(form);
    const deadline =
      new Date(formData.get("todo-deadline") as string).toDateString() === "Invalid Date"
        ? CF.monthsAfterToday(1)
        : new Date(formData.get("todo-deadline") as string);
    const itodo: IToDo = {
      task: formData.get("todo-task") as string,
      deadline,
      status: formData.get("todo-status") as ToDoStatus,
    };
    try {
      project.newToDo(itodo);
      addTodo(itodo);
      onCancelClick();
    } catch (error) {}
  };

  project.onFilterTodo = (filtered) => {
    setList([...filtered]);
  };

  //details page todocontainer end

  return (
    <div id="project-details" className="page">
      <DetailsHeader project={project} />
      <div className="main-page-content">
        <div id="details-container">
          <DetailsCard project={project} />
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
                    <span className="material-symbols-outlined">check_circle</span>Accept
                  </button>
                </div>
              </form>
            </dialog>
            <div className="todo-header">
              <h3>To-Do</h3>
              <div>
                <SearchBox items="tasks" onChange={(value) => project.filterTodo(value)} />
                <button project-info-btn="todo-add" todo-add="" onClick={onNewTodoClick}>
                  <span className="material-symbols-outlined">playlist_add</span>
                </button>
              </div>
            </div>
            <div todo-list-container="" className="todo-list">
              {todoList.length === 0 ? <>ToDo was not found!</> : todoList}
            </div>
          </div>
        </div>
        <IFCViewer />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
