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
  cost?: number;
  progress?: number;
  boxColor?: string;
  todoList?: ToDo[];
}

export class Project implements IProject {
  //To satisfy IProject
  name: string;
  description: string;
  status: Status;
  role: Role;
  date: Date;
  cost: number = 0;
  progress: number = 0;

  //Class internals
  id: string;
  initials: string;
  boxColor: string = getRandomColor();
  todoList: ToDo[] = [];

  //Events
  onNewTodo = (todo: ToDo) => {};
  onDeleteTodo = () => {};
  onFilterTodo = (filtered: ToDo[]) => {};

  constructor(data: IProject, id = uuid4()) {
    //Project Data definitions
    this.id = id;
    for (const key in data) {
      this[key] = data[key];
    }
    this.initials = getInitials(this.name);
  }

  filterTodo(value: string) {
    const filtered = this.getToDoList().filter((todo) => todo.task.toLowerCase().includes(value.toLowerCase()));
    this.onFilterTodo(filtered);
  }

  private addDummyToDo() {
    const itodo: IToDo = {
      task: "test task, this is a dummy task created automatically deadline is 1 month from today",
      deadline: monthsAfterToday(-1),
      status: "active",
      projectId: this.id,
      priority: "normal",
    };
    this.newToDo(itodo);
    //console.log("addDumyToDo() successfull");
  }

  newToDo(iTodo: IToDo, id?: string) {
    if (id && this.checkToDoExist(id)) {
      throw new Error("Todo is already exists");
    }
    //console.log("creating new todo");
    const todo = new ToDo(iTodo, id);
    //console.log("created:", todo);
    this.todoList.push(todo);
    //console.log(todo, " todo added successfully");
    this.onNewTodo(todo);
    return todo;
  }

  updateToDo(id: string, data: IToDo) {
    const existingTodo = this.getToDo(id);
    if (!(existingTodo instanceof ToDo)) return;
    existingTodo.task = data.task;
    existingTodo.setStatus(data.status);
    existingTodo.setDeadline(data.deadline);
  }

  checkToDoExist(id: string) {
    const todoIds = this.todoList.map((todo) => {
      return todo.taskId;
    });
    const isTodoExist = todoIds.includes(id);
    return isTodoExist;
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
    //console.log("changeToActive() successfull");
  }

  changeToCompleted(id: string) {
    const todo = this.getToDo(id) as ToDo;
    todo.setStatus("completed");
    //console.log("changeToCompleted() successfull");
  }

  changeToOverdue(id: string) {
    const todo = this.getToDo(id) as ToDo;
    todo.setStatus("overdue");
    //console.log("changeToOverdue() successfull");
  }

  removeToDo(id: string) {
    const todo = this.getToDo(id);
    if (!todo) return; //console.log(id, "this todo item doesn't exist.");
    const remaining = this.todoList.filter((todo) => todo.taskId !== id);
    this.todoList = remaining;
  }

  edit(data: IProject) {
    for (const key in data) {
      //console.log(this.name, ":", key, "editing...");
      const value = data[key] ? data[key] : this[key];
      this[key] = value;
    }
    this.initials = getInitials(this.name);
  }

  update(data: IProject) {
    for (const key in data) {
      //console.log(this.name, ":", key, "updating");
      this[key] = data[key] ? data[key] : this[key];
    }
    this.initials = getInitials(this.name);
  }
}
