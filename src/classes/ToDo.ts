import { monthsAfter } from "./Project";
import { v4 as uuid4 } from "uuid";

export function formatDateString(strDate:string){
  const date=new Date(strDate)
  return formatDate(date)
}

export function formatDate(date:Date){
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const formatted={
    day:date.getDate().toString(),
    month:months[date.getMonth()],
    year:date.getFullYear().toString()
  }
  return formatted
}

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
    console.log(this.deadline)
    this.status="active"
    console.log("1",this.status)
    this.setUi();
    console.log("2",this.status)
    this.checkStatus()
    console.log("3",this.status)
  }

  //methods
  private checkStatus() {
    const today = new Date()
    if(this.deadline>=today && this.status==="active"){
      console.log("1")
      this.setStatus("active")
      return this.status
    }
    if(this.deadline>=today && this.status==="completed"){
      console.log("2")
      this.setStatus("completed")
      return this.status
    }
    if(this.deadline>=today && this.status==="overdue") {
      console.log("3")
      this.setStatus("active")
      return this.status
    }
    if(this.deadline<today && this.status==="active"){
      console.log("4")
      this.setStatus("overdue")
      return this.status
    }
    if(this.deadline<today && this.status==="completed"){
      console.log("5")
      this.setStatus("completed")
      return this.status
    }
    if(this.deadline<today && this.status==="overdue"){
      console.log("5")
      this.setStatus("overdue")
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
    const {day,month,year}=formatDate(this.deadline)
    const template = `
    <p todo-list-functions="toggle-active"><span class="material-symbols-outlined">
        ${status_symbol}
    </span></p>
    <p todo-id style="content-visibility:hidden">${this.taskId}</p>
    <p>${this.task}</p>
    <p>${year}-${month}-${day}</p>`;
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
