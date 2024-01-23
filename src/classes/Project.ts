import { v4 as uuid4 } from "uuid";
import { IToDo, ToDo } from "./ToDo";
import {
  basicToNativeDate,
  correctDate,
  editDummy,
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
      "id",
      "name",
      "description",
      "status",
      "role",
      "date",
      "cost",
      "progress",
      "initials",
      "boxColor",
    ];
    for (const key of keys) {
      this[key] = data[key];
      if (key === "id") {
        this[key] = data[key] ? data[key] : uuid4();
      }
    }
    if (data.date.toString() === "Invalid Date") {
      console.log(
        "There is no date input, project finish date is set to 6 months from today by default."
      );
      this.date = monthsAfterToday(6);
    }
    this.date = basicToNativeDate(correctDate(data.date));
    this.setInitialsBox();
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
    this.ui.innerHTML = this.getUiTemplate();
    this.ui.className = "project-card";
  }

  private getUiTemplate() {
    const html = `<div class="card-header">
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
    return html;
  }

  updateUi() {
    this.initials = getInitials(this.name);
    this.ui.innerHTML = this.getUiTemplate();
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

  editProject(editedData: EProject) {
    for (const key in editDummy) {
      console.log(key, "current:", this[key], " edited:", editedData[key]);
      const value = editedData[key] ? editedData[key] : this[key];
      this[key] = value;
      console.log(key, "result:", this[key]);
      this.updateUi();
    }
  }
}
