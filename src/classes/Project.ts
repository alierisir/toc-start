import { v4 as uuid4 } from "uuid";
import { IToDo, ToDo } from "./ToDo";

export type Status = "active" | "pending" | "finished";
export type Role = "engineer" | "architect" | "developer";

export interface IProject {
  name: string;
  description: string;
  status: Status;
  role: Role;
  date: Date;
}

//Global Functions that may help

export function monthsAfter(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}
//---------------------------------

export class Project implements IProject {
  //To satisfy IProject
  name: string;
  description: string;
  status: Status;
  role: Role;
  date: Date;

  //Class internals
  ui: HTMLDivElement;
  cost: number = 0;
  progress: number = 0;
  id: string;
  initials: string;
  boxColor: string;
  todoList: ToDo[] = [];

  constructor(data: IProject) {
    //Project Data definitions
    const keys = [
      "name",
      "description",
      "status",
      "role",
      "date",
      "initials",
      "boxColor",
    ];
    for (const key of keys) {
      this[key] = data[key];
    }
    if (data.date.toString() === "Invalid Date") {
      this.date = monthsAfter(6);
    }
    this.setInitialsBox();
    this.id = uuid4();
    this.setUi();
  }

  setInitialsBox() {
    if (this.boxColor && this.initials) {
      return;
    }
    const words = this.name.split(" ");
    const count = words.length;
    let initials: string;
    if (count < 2) {
      initials = words[0][0] + words[0][1];
    } else {
      initials = words[0][0] + words[count - 1][0];
    }
    const colors = [
      "#50ad45",
      "#7c45ad",
      "#ad4545",
      "#45a3ad",
      "#4745ad",
      "#bd53c3",
      "#56b84f",
      "#a647b8",
      "#b84f4f",
      "#4faab8",
      "#4f4fb8",
      "#d362d1",
      "#ad5845",
      "#45adad",
      "#ad8145",
      "#4596ad",
    ];
    const selectedColor =
      colors[Math.floor((Math.random() * 100) % colors.length)];
    this.initials = initials;
    this.boxColor = selectedColor;
  }

  setUi() {
    if (this.ui) {
      return;
    }
    this.ui = document.createElement("div");
    this.ui.innerHTML = `<div class="card-header">
        <p style='background-color:${this.boxColor}'>${this.initials}</p>
        <div>
        <h2>${this.name}</h2>
        <p >${this.description}</p>
        </div>
        </div>
        <div class="card-content">
        <div class="card-property">
            <p>Status</p>
            <p>${this.status}</p>
        </div>
        <div class="card-property">
            <p>Role</p>
            <p>${this.role}</p>
        </div>
        <div class="card-property">
            <p>Cost</p>
            <p>$${this.cost}</p>
        </div>
        <div class="card-property">
            <p>Estimated Progress</p>
            <p>${this.progress}%</p>
        </div>
        </div>
        `;
    this.ui.className = "project-card";
  }

  addDummyToDo() {
    const itodo = {
      task: "test task, this is a dummy task created automatically deadline is 1 month from today",
      deadline: monthsAfter(-1),
    };
    const todo = new ToDo(itodo);
    this.todoList.push(todo);
    console.log("addDumyToDo() successfull");
    return todo;
  }

  newToDo(iTodo: IToDo) {
    const todo = new ToDo(iTodo);
    this.todoList.push(todo);
    return todo;
  }

  getToDoList() {
    return this.todoList;
  }

  getToDo(id: string) {
    const todo = this.todoList.find((todo) => todo.taskId === id);
    return todo;
  }

  changeToActive(id: string) {
    const todo = this.getToDo(id) as ToDo;
    todo.setStatus("active");
    console.log("changeToActive() successfull");
  }

  changeToCompleted(id: string) {
    const todo = this.getToDo(id) as ToDo;
    todo.setStatus("completed");
    console.log("changeToCompleted() successfull");
  }

  changeToOverdue(id: string) {
    const todo = this.getToDo(id) as ToDo;
    todo.setStatus("overdue");
    console.log("changeToOverdue() successfull");
  }

  removeToDo(id: string) {
    const todo = this.getToDo(id);
    if (!todo) return console.log(id, "this todo item doesn't exist.");
    todo.ui.remove();
    const remaining = this.todoList.filter((todo) => todo.taskId !== id);
    this.todoList = remaining;
  }

  updateProject(project: Project) {
    const keys = Object.keys(this);
    //['cost', 'progress', 'todoList', 'name', 'description', 'status', 'role', 'date', 'initials', 'boxColor', 'id', 'ui']
    for (const key of keys) {
      if (project[key]) {
        this[key] = project[key];
      }
    }
  }
}
