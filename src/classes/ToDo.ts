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
    this.checkStatus()
    this.setUi();
  }

  //methods
  private checkStatus() {
    const today = new Date()
    if (this.deadline>today){
      if(this.status==="completed"||this.status==="active"){
        return this.status
      }
    }else{
      this.status="overdue"
      return this.status
    }
  }

  setDeadline(date: Date) {
    this.deadline = date;
    this.checkStatus()
  }

  getStatus() {
    return this.status;
  }

  setStatus(status: ToDoStatus) {
    this.status = status;
    this.updateUi();
  }

  setUi() {
    if (this.ui) return console.log("todo item ui already exists!");
    this.ui = document.createElement("div");
    this.ui.innerHTML = this.getTemplate();
    this.ui.className = `list-item todo-${this.getStatus()}`;
    console.log(this.taskId, "setUi() successfull");
    this.ui.addEventListener("click",()=>{
      this.toggleStatus(this.status)
    })
  }

  private getTemplate() {
    const symbols = {
      active: "check_box_outline_blank",
      completed: "check_box",
      overdue: "disabled_by_default",
    };
    const status = this.status;
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
    this.ui.className = `list-item todo-${this.status}`;
    this.ui.innerHTML = this.getTemplate();
    console.log("updateUi() successfull");
  }

  private toggleStatus(status:ToDoStatus){
    if(status==="active") return this.setStatus("completed")
    if(status==="completed") return this.setStatus("active")
    if(status==="overdue") {
      alert("note to self: add a date input or delete task options here. for now deadline is updated to 1 month from today!")
      this.setDeadline(monthsAfter(1))
    }
  }
}
