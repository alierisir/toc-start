import { monthsAfter } from "./Project";
import { v4 as uuid4 } from "uuid";

export type ToDoStatus = "active" | "completed" | "overdue";

export interface IToDo {
  task: string;
  deadline: Date;
}

export class ToDo implements IToDo {
  //satisfy IToDo
  task: string =
    "this is a blank task created by default.Deadline is set to 1 month from today.";
  deadline: Date = monthsAfter(1);

  //class internals
  status: ToDoStatus = "active";
  taskId: string;
  ui: HTMLElement;

  constructor(data: IToDo) {
    this.taskId = uuid4();
    this.task = data.task;
    this.deadline = data.deadline;
    this.setUi();
  }

  //methods
  private checkStatus() {
    const today = new Date();
    if (this.deadline >= today || this.status === "completed") return;
    else this.setStatus("overdue");
    console.log("checkStatus successfull");
  }

  setDeadline(date: Date) {
    this.deadline = date;
  }

  getStatus() {
    this.checkStatus();
    return this.status;
  }

  setStatus(status: ToDoStatus) {
    this.status = status;
    this.updateUi();
  }

  setUi() {
    this.checkStatus();
    if (this.ui) return console.log("todo item ui already exists!");
    this.ui = document.createElement("div");
    this.ui.innerHTML = this.getTemplate();
    this.ui.className = `list-item todo-${this.getStatus()}`;
    console.log(this.taskId, "setUi() successfull");
  }

  private getTemplate() {
    const symbols = {
      active: "check_box_outline_blank",
      completed: "check_box",
      overdue: "disabled_by_default",
    };
    const status = this.getStatus();
    const status_symbol = symbols[status];
    const formattedDate = this.deadline.toDateString().split("T")[0].split(" ");
    const template = `
    <p todo-list-functions="toggle-active"><span class="material-symbols-outlined">
        ${status_symbol}
    </span></p>
    <p todo-id style="content-visibility:hidden">${this.taskId}</p>
    <p>${this.task}</p>
    <p>${formattedDate[3]}-${formattedDate[1]}-${formattedDate[2]}</p>`;
    return template;
  }

  getUi() {
    return this.ui;
  }

  private updateUi() {
    this.checkStatus();
    this.ui.className = `list-item todo-${this.getStatus()}`;
    this.ui.innerHTML = this.getTemplate();
    console.log("updateUi() successfull");
  }
}
