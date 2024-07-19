import React from "react";
import {
  IToDo,
  ToDo,
  ToDoPriority,
} from "../bim-components/TodoCreator/src/ToDo";
import { updateDocument } from "../firebase";

interface Props {
  todo: ToDo;
  onDeleteClick?: () => void;
  onCardClick?: () => void;
}

const ToDoCard = ({ todo, onDeleteClick, onCardClick }: Props) => {
  const [status, setStatus] = React.useState(todo.getStatus());
  const [priority, setPriority] = React.useState(todo.priority);
  const [deadline, setDeadline] = React.useState(todo.deadline);
  const [task, setTask] = React.useState(todo.task);

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

  const onCancelClick = () => {
    const modal = document.getElementById(
      "edit-todo-modal"
    ) as HTMLDialogElement;
    modal.close();
    const form = document.getElementById("edit-todo-form") as HTMLFormElement;
    form.reset();
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById("edit-todo-form") as HTMLFormElement;
    const formData = new FormData(form);
    const deadline =
      new Date(formData.get("todo-deadline") as string).toDateString() ===
      "Invalid Date"
        ? todo.deadline
        : new Date(formData.get("todo-deadline") as string);
    const data: Partial<IToDo> = {
      task: formData.get("todo-task")
        ? (formData.get("todo-task") as string)
        : todo.task,
      deadline,
      priority: formData.get("todo-priority")
        ? (formData.get("todo-priority") as ToDoPriority)
        : todo.priority,
    };
    try {
      if (data.task && data.priority) todo.edit(data.task, data.priority);
      if (data.deadline) await todo.setDeadline(data.deadline);
      setDeadline(todo.deadline);
      setPriority(todo.priority);
      setTask(todo.task);
      onCancelClick();
    } catch (error) {
      console.log(error);
    }
    setStatus(todo.getStatus());
    await updateDocument("/todos", todo.taskId, { status: todo.status });
  };

  const onEditTodoClick = () => {
    const modal = document.getElementById(
      "edit-todo-modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };

  return (
    <div>
      <dialog id="edit-todo-modal">
        <form
          id="edit-todo-form"
          className="modal-container"
          onSubmit={(e) => {
            onFormSubmit(e);
          }}
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">assignment_add</span>
            Edit ToDo
          </h2>
          <div className="project-properties">
            <label htmlFor="todo-task">
              <span className="material-symbols-outlined">assignment</span>Edit
              Task
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
            <label htmlFor="todo-priority">
              <span className="material-symbols-outlined">assignment_late</span>
              Edit Priority
            </label>
            <select name="todo-priority" id="todo-priority">
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="todo-deadline">
              <span className="material-symbols-outlined">event</span>Edit
              Deadline
            </label>
            <input id="todo-deadline" name="todo-deadline" type="date" />
          </div>
          <div className="button-section">
            <button
              id="todo-cancel"
              type="button"
              className="cancel-btn"
              onClick={onCancelClick}
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
      <div className={`todo-card todo-${status}-${priority}`}>
        <p
          todo-list-functions="toggle-active"
          onClick={onCheckboxClicked}
          className="todo-checkbox"
        >
          <span className="material-symbols-outlined">{status_symbol}</span>
        </p>
        <div className="task-date-section">
          <div style={{ display: "flex", gap: "15px" }}>
            <p className="date">{deadline.toLocaleDateString()}</p>
            <p className="edit-todo-btn" onClick={onEditTodoClick}>
              <span className="material-symbols-outlined">more_horiz</span>
            </p>
            {getFragmentQty() ? (
              <p style={{ fontSize: "0.6rem", fontStyle: "italic" }}>
                {getFragmentQty()} elements assigned
              </p>
            ) : null}
          </div>
          <p className="task">{task}</p>
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
    </div>
  );
};

export default ToDoCard;
