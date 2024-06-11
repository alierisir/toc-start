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
  onDeleteTodo = () => {};
  onFilterTodo = (filtered: ToDo[]) => {};
  onProjectUpdated = (project: Project) => {};

  constructor(data: IProject, id = uuid4()) {
    //Project Data definitions
    const keys = ["name", "description", "status", "role", "date", "cost", "progress", "initials", "boxColor"];
    this.id = id;
    for (const key of keys) {
      this[key] = data[key];
      if (key === "cost") {
        this[key] = data[key] ? data[key] : 0;
      }
      if (key === "progress") {
        this[key] = data[key] ? data[key] : 0;
      }
    }
    if (data.date.toString() === "Invalid Date") {
      //console.log("There is no date input, project finish date is set to 6 months from today by default.");
      this.date = monthsAfterToday(6);
    } else {
      this.date = basicToNativeDate(correctDate(data.date));
    }
    this.initials = getInitials(this.name);
    this.boxColor = getRandomColor();
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

  editProject(editedData: EProject) {
    for (const key in editDummy) {
      const value = editedData[key] ? editedData[key] : this[key];
      this[key] = value;
    }
    this.onChange(this);
  }

  updateProject(data: IProject | EProject) {
    for (const key in data) {
      this[key] = data[key] ? data[key] : this[key];
    }
    this.onProjectUpdated(this);
    return this;
  }
}
