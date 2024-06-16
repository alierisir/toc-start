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
    const itodo = {
      task: "test task, this is a dummy task created automatically deadline is 1 month from today",
      deadline: monthsAfterToday(-1),
    };
    this.newToDo(itodo);
    //console.log("addDumyToDo() successfull");
  }

  newToDo(iTodo: IToDo) {
    if (this.checkToDoExist(iTodo)) return this.updateToDo(iTodo as ToDo);
    const todo = new ToDo(iTodo);
    this.todoList.push(todo);
    //console.log(todo.taskId, " todo added successfully");
    this.onNewTodo(todo);
    return todo;
  }

  updateToDo(todo: ToDo) {
    const existingTodo = this.getToDo(todo.taskId);
    if (existingTodo) {
      existingTodo.task = todo.task;
      existingTodo.setStatus(todo.status);
      existingTodo.setDeadline(todo.deadline);
    }
  }

  checkToDoExist(iTodo: IToDo) {
    const todoIds = this.todoList.map((todo) => {
      return todo.taskId;
    });
    const id = iTodo.taskId ? iTodo.taskId : false;
    if (!id) return false;
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
      console.log(this.name, ":", key, "editing...");
      const value = data[key] ? data[key] : this[key];
      this[key] = value;
    }
    this.initials = getInitials(this.name);
  }

  update(data: IProject) {
    for (const key in data) {
      console.log(this.name, ":", key, "updating");
      this[key] = data[key] ? data[key] : this[key];
    }
    this.initials = getInitials(this.name);
  }
}
