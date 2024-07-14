import * as OBC from "openbim-components";
import * as THREE from "three";
import { TodoCard } from "./TodoCard";
import { TodoCreator } from "..";
import { monthsAfterToday } from "../../../classes/CustomFunctions";

export type ToDoPriority = "low" | "normal" | "high";

export type ToDoStatus = "active" | "completed" | "overdue";

export interface IToDo {
  task: string;
  projectId: string;
  status?: ToDoStatus;
  deadline?: Date;
  priority?: ToDoPriority;
}

export class ToDo extends OBC.Component<ToDo> implements IToDo, OBC.Disposable {
  enabled: boolean = true;
  private _components: OBC.Components;
  //Own Properties
  projectId: string;
  taskId: string;
  task: string;
  deadline: Date = monthsAfterToday(1);
  status: ToDoStatus = "active";
  priority: ToDoPriority = "normal";
  camera: { position: THREE.Vector3; target: THREE.Vector3 } = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
  };
  fragmentMap: OBC.FragmentIdMap;
  card: TodoCard;

  constructor(components: OBC.Components, data: IToDo, taskId: string) {
    super(components);
    this._components = components;
    this.taskId = taskId;
    for (const key of Object.keys(data)) {
      console.log(data);
      this[key] = data[key];
    }
    this.setup();
    this.createCard();
  }

  private async setup() {
    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera))
      return console.warn("OrthoPerspective Camera is not found!");
    const position = new THREE.Vector3();
    const target = new THREE.Vector3();
    camera.controls.getPosition(position);
    camera.controls.getTarget(target);
    this.camera.position.x = position.x;
    this.camera.position.y = position.y;
    this.camera.position.z = position.z;
    this.camera.target.x = target.x;
    this.camera.target.y = target.y;
    this.camera.target.z = target.z;
    this.fragmentMap = highlighter.selection.select;
  }

  async createCard() {
    const todoCard = new TodoCard(this._components);
    this.card = todoCard;
    this.card.description = this.task;
    this.card.date = this.deadline;
    this.card.priority = this.priority;

    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );

    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera))
      return console.warn(
        "This operation requires an active OrthoPerspective Camera"
      );

    this.card.onCardClick.add(async () => {
      await camera.fit();
      try {
        await highlighter.highlightByID("select", this.fragmentMap);
      } catch (error) {
        console.log("To-do has no fragments assigned.");
      }
      camera.controls.setLookAt(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z,
        this.camera.target.x,
        this.camera.target.y,
        this.camera.target.z,
        true
      );
    });

    const deleteButton = new OBC.Button(this._components);
    deleteButton.materialIcon = "delete";

    this.card.slots.actionButtons.addChild(deleteButton);
    deleteButton.onClick.add(async () => {
      await this.dispose();
    });
  }

  get(): ToDo {
    return this;
  }
  async dispose() {
    const creator = await this._components.tools.get(TodoCreator);
    creator.deleteTodo(this.taskId);
    this.card.enabled = false;
    await this.card.dispose();
    this.enabled = false;
    creator.updateList();
  }

  checkStatus() {
    const today = new Date();
    if (this.deadline >= today && this.status === "active") {
      console.log("Task is waiting to be done.");
      this.setStatus("active");
      return this.status;
    }
    if (this.deadline >= today && this.status === "completed") {
      console.log("Task is completed early.");
      this.setStatus("completed");
      return this.status;
    }
    if (this.deadline >= today && this.status === "overdue") {
      console.log(
        "There is still time for the task to be completed, changing status to 'active'."
      );
      this.setStatus("active");
      return this.status;
    }
    if (this.deadline < today && this.status === "active") {
      console.log("Task is overdue.");
      this.setStatus("overdue");
      return this.status;
    }
    if (this.deadline < today && this.status === "completed") {
      console.log("Task is already completed.");
      this.setStatus("completed");
      return this.status;
    }
    if (this.deadline < today && this.status === "overdue") {
      console.log("Task couldn't be completed in time!");
      this.setStatus("overdue");
      return this.status;
    }
    return this.status;
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
