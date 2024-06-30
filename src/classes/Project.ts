import { v4 as uuid4 } from "uuid";
import { basicToNativeDate, correctDate, getInitials, getRandomColor, monthsAfterToday } from "./CustomFunctions";
import { ToDo } from "../bim-components/TodoCreator/src/ToDo";

export type Action = "added" | "removed" | "updated";
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
  initials: string;
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
  cost: number = 0;
  progress: number = 0;
  id: string;
  initials: string;
  boxColor: string;
  todoList: ToDo[] = [];

  //Events
  onChange = (project: Project) => {};
  onToDoListUpdate = () => {};
  onToDoListFiltered = (filtered: ToDo[]) => {};

  constructor(data: IProject) {
    //Project Data definitions
    const keys = ["id", "name", "description", "status", "role", "date", "cost", "progress", "initials", "boxColor"];
    for (const key of keys) {
      this[key] = data[key];
      if (key === "id") {
        this[key] = data[key] ? data[key] : uuid4();
      }
      if (key === "cost") {
        this[key] = data[key] ? data[key] : 0;
      }
      if (key === "progress") {
        this[key] = data[key] ? data[key] : 0;
      }
    }
    if (data.date.toString() === "Invalid Date") {
      console.log("There is no date input, project finish date is set to 6 months from today by default.");
      this.date = monthsAfterToday(6);
    } else {
      this.date = basicToNativeDate(correctDate(data.date));
    }
    this.setInitialsBox();
  }

  setInitialsBox() {
    if (this.boxColor && this.initials) {
      return;
    }
    this.initials = getInitials(this.name);
    this.boxColor = getRandomColor();
  }

  edit(editedData: Partial<Project>) {
    for (const key of Object.keys(editedData)) {
      console.log(key);
      this[key] = editedData[key];
    }
    this.onChange(this);
  }

  getToDoList(): ToDo[] {
    return this.todoList;
  }

  updateToDoList(list: ToDo[]): ToDo[] {
    this.todoList = list;
    this.onToDoListUpdate();
    return this.todoList;
  }

  filterToDoList(value: string) {
    const filtered = this.getToDoList().filter((todo) => todo.task.toLowerCase().includes(value.toLowerCase()));
    this.onToDoListFiltered(filtered);
  }
}
