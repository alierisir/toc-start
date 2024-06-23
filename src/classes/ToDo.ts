import { monthsAfterToday, correctDate, dateAfterFromPoint } from "./CustomFunctions";
import { v4 as uuid4 } from "uuid";
import * as Firestore from "firebase/firestore";
import * as THREE from "three";

export type ToDoStatus = "active" | "completed" | "overdue";
export type ToDoPriority = "low" | "normal" | "high";
export interface IToDo {
  task: string;
  status: ToDoStatus;
  deadline: Date;
  priority: ToDoPriority;
}

export class ToDo implements IToDo {
  //satisfy IToDo
  task: string = "this is a blank task created by default.Deadline is set to 1 month from today.";
  deadline: Date;
  status: ToDoStatus = "active";
  priority: ToDoPriority = "normal";
  //class internal
  taskId: string;

  constructor(data: IToDo, id: string = uuid4()) {
    this.taskId = id;
    this.task = data.task;
    this.priority = data.priority;
    this.deadline = data.deadline;
    this.status = data.status ? data.status : "active";
    this.checkStatus();
  }

  //methods
  private checkStatus() {
    const today = new Date();
    if (this.deadline >= today && this.status === "active") {
      //console.log("Task is waiting to be done.");
      this.setStatus("active");
      return this.status;
    }
    if (this.deadline >= today && this.status === "completed") {
      //console.log("Task is completed early.");
      this.setStatus("completed");
      return this.status;
    }
    if (this.deadline >= today && this.status === "overdue") {
      //console.log("There is still time for the task to be completed, changing status to 'active'.");
      this.setStatus("active");
      return this.status;
    }
    if (this.deadline < today && this.status === "active") {
      //console.log("Task is overdue.");
      this.setStatus("overdue");
      return this.status;
    }
    if (this.deadline < today && this.status === "completed") {
      //console.log("Task is already completed.");
      this.setStatus("completed");
      return this.status;
    }
    if (this.deadline < today && this.status === "overdue") {
      //console.log("Task couldn't be completed in time!");
      this.setStatus("overdue");
      return this.status;
    }
  }

  setDeadline(date: Date) {
    this.deadline = date;
    this.checkStatus();
  }

  getStatus() {
    return this.status;
  }

  setStatus(status: ToDoStatus) {
    this.status = status;
  }

  toggleStatus(status: ToDoStatus) {
    if (status === "active") return this.setStatus("completed");
    if (status === "completed") {
      if (this.deadline < new Date()) {
        return this.setStatus("overdue");
      } else {
        return this.setStatus("active");
      }
    }
    if (status === "overdue") {
      console.log(
        "note to self: add a date input or delete task options here. for now deadline is updated to 1 month from today!"
      );
      return this.setDeadline(monthsAfterToday(1));
    }
  }
}
