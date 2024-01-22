import { v4 as uuid4 } from "uuid";
import { IToDo, ToDo } from "./ToDo";
import {
  getInitials,
  getRandomColor,
  monthsAfterToday,
} from "./CustomFunctions";

export type Status = "active" | "pending" | "finished";
export type Role = "engineer" | "architect" | "developer";

export interface IProject {
  name: string;
  description: string;
  status: Status;
  role: Role;
  date: Date;
}

export interface EProject extends IProject {
  id: string;
  cost: number;
  progress: number;
}

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
      console.log(
        "There is no date input, project finish date is set to 6 months from today by default."
      );
      this.date = monthsAfterToday(6);
    }
    this.setInitialsBox();
    this.id = uuid4();
    this.setUi();
  }

  setInitialsBox() {
    if (this.boxColor && this.initials) {
      return;
    }
    this.initials = getInitials(this.name);
    this.boxColor = getRandomColor();
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

  updateUi() {
    this.initials = getInitials(this.name);
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
  }

  private addDummyToDo() {
    const itodo = {
      task: "test task, this is a dummy task created automatically deadline is 1 month from today",
      deadline: monthsAfterToday(-1),
    };
    this.newToDo(itodo);
    console.log("addDumyToDo() successfull");
  }

  newToDo(iTodo: IToDo) {
    const todo = new ToDo(iTodo);
    this.todoList.push(todo);
    console.log(todo.taskId, " todo added successfully");
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
