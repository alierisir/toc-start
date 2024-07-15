import { v4 as uuidv4 } from "uuid";
import {
  basicToNativeDate,
  correctDate,
  getInitials,
  getRandomColor,
  monthsAfterToday,
} from "./CustomFunctions";
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
  onChange = (data: Partial<Project>) => {};
  onToDoCreated = (todo: ToDo) => {};
  onToDoDeleted = () => {};
  onToDoListUpdate = () => {};
  onToDoListFiltered = (filtered: ToDo[]) => {};

  constructor(data: IProject, id = uuidv4()) {
    //Project Data definitions
    this.id = id;
    for (const key in data) {
      this[key] = data[key];
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
    //console.log(`${this.name} is being updated...`)
    for (const key in editedData) {
      if (this[key] !== editedData[key]) {
        //console.log(key,"\nold:",this[key],"\nnew:",editedData[key]);
        this[key] = editedData[key];
      }
    }
    this.onChange(editedData);
    //console.log(`${this.name} is updated.`)
  }

  update(data: Partial<Project>) {}

  getToDoList(): ToDo[] {
    return this.todoList;
  }

  updateToDoList(list: ToDo[]): ToDo[] {
    this.todoList = list;
    this.onToDoListUpdate();
    return this.todoList;
  }

  newToDo(todo: ToDo) {
    this.todoList.push(todo);
    this.onToDoCreated(todo);
    this.onToDoListUpdate();
  }

  removeToDo(id: string) {
    const remaining = this.todoList.filter((todo) => todo.taskId !== id);
    this.todoList = remaining;
    this.onToDoDeleted();
    this.onToDoListUpdate();
  }

  getToDo(id: string) {
    return this.todoList.find((todo) => todo.taskId === id);
  }

  filterToDoList(value: string) {
    const filtered = this.getToDoList().filter((todo) =>
      todo.task.toLowerCase().includes(value.toLowerCase())
    );
    this.onToDoListFiltered(filtered);
  }
}
