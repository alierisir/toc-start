import { v4 as uuid4 } from "uuid";
import { IToDo, ToDo, ToDoStatus } from "./ToDo";
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
  onNewTodo = (todo: ToDo) => {};
  onUpdateTodo = (todo: ToDo) => {};
  onDeleteTodo = (remaining: ToDo[]) => {};
  onFilterTodo = (filtered: ToDo[]) => {};

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

  filterTodo(value: string) {
    const filtered = this.getToDoList().filter((todo) => todo.task.toLowerCase().includes(value.toLowerCase()));
    this.onFilterTodo(filtered);
  }

  setInitialsBox() {
    if (this.boxColor && this.initials) {
      return;
    }
    this.initials = getInitials(this.name);
    this.boxColor = getRandomColor();
  }

  newToDo(todo: ToDo) {
    const list = this.getToDoList();
    if (list.find((existing) => todo.taskId === existing.taskId))
      throw new Error(`Todo "${todo.taskId}" already exists.`);
    this.todoList.push(todo);
    this.onNewTodo(todo);
  }

  updateToDo(taskId: string, data: Partial<ToDo>) {
    try {
      const todo = this.getToDo(taskId);
      const keys = Object.keys(data);
      for (const key of keys) {
        todo[key] = data[key];
      }
      this.onUpdateTodo(todo);
    } catch (error) {
      console.log(error, " Update Failed!");
    }
  }

  getToDoList() {
    return this.todoList;
  }

  getToDo(taskId: string) {
    const todo = this.todoList.find((todo) => {
      todo.taskId === taskId;
    });
    if (!todo) throw new Error(`ProjectClass: TaskId "${taskId}" is not found`);
    return todo;
  }

  changeStatus(taskId: string, status: ToDoStatus) {
    try {
      const todo = this.getToDo(taskId);
      todo.setStatus(status);
      todo.checkStatus();
      this.onUpdateTodo(todo);
    } catch (error) {
      console.log(error, " Status change failed");
    }
  }

  removeToDo(taskId: string) {
    const list = this.getToDoList();
    const remaining = list.filter((todo) => todo.taskId !== taskId);
    this.todoList = remaining;
    this.onDeleteTodo(this.todoList);
  }

  edit(editedData: Partial<Project>) {
    for (const key in Object.keys(editedData)) {
      this[key] = editedData[key];
    }
    this.onChange(this);
  }
}
