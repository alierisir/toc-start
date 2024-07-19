import * as OBC from "openbim-components";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { TodoCard } from "./TodoCard";
import { TodoCreator } from "..";
import { monthsAfterToday } from "../../../classes/CustomFunctions";
import { updateDocument } from "../../../firebase";

export type ToDoPriority = "low" | "normal" | "high";

export type ToDoStatus = "active" | "completed" | "overdue";

export type SimpleVector = {
  x: number;
  y: number;
  z: number;
};

export const fragmentMapToJSON = (fragmentIdMap: OBC.FragmentIdMap) => {
  ////console.log("ID Map:", fragmentIdMap);
  const mapObj = {};
  for (const fragmentId in fragmentIdMap) {
    ////console.log("ID:", fragmentId);
    ////console.log("set: ", fragmentIdMap[fragmentId]);
    let arrObj: string[] = [];
    for (const expressID of fragmentIdMap[fragmentId]) {
      ////console.log("expressId: ", expressID);
      arrObj.push(expressID);
    }
    mapObj[fragmentId] = [...arrObj];
  }
  return mapObj;
};

export const jsonTofragmentMap = (jsonMap: Record<string, string[]>) => {
  const fragmentMap: OBC.FragmentIdMap = {};
  for (const fragmentId in jsonMap) {
    let arrObj: string[] = [];
    for (const expressID of jsonMap[fragmentId]) {
      arrObj.push(expressID);
    }
    fragmentMap[fragmentId] = new Set<string>(arrObj);
  }
  return fragmentMap;
};

export interface IToDo {
  task: string;
  projectId: string;
  status?: ToDoStatus;
  deadline?: Date;
  priority?: ToDoPriority;
  camera?: { position: SimpleVector; target: SimpleVector };
  fragmentMap?: OBC.FragmentIdMap | Record<string, string[]>;
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

  onEdit = async (data: Partial<ToDo>) => {
    updateDocument("/todos", this.taskId, data);
  };

  constructor(
    components: OBC.Components,
    data: IToDo,
    taskId: string = uuidv4()
  ) {
    super(components);
    this._components = components;
    this.taskId = taskId;
    for (const key of Object.keys(data)) {
      ////console.log(data);
      this[key] = data[key];
    }
    this.setup(data);
    this.checkStatus();
    this.createCard();
  }

  private async setup(data: IToDo) {
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

    //If it's new: create and store camera and fragmentmap from tools update the database | if it exists: make sure it gets the data from database.
    this.camera.position.x = data.camera ? data.camera.position.x : position.x;
    this.camera.position.y = data.camera ? data.camera.position.y : position.y;
    this.camera.position.z = data.camera ? data.camera.position.z : position.z;
    this.camera.target.x = data.camera ? data.camera.target.x : target.x;
    this.camera.target.y = data.camera ? data.camera.target.y : target.y;
    this.camera.target.z = data.camera ? data.camera.target.z : target.z;
    this.fragmentMap = data.fragmentMap
      ? jsonTofragmentMap(data.fragmentMap as Record<string, string[]>)
      : highlighter.selection.select;

    await updateDocument("/todos", this.taskId, {
      camera: {
        position: {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        },
        target: {
          x: this.camera.target.x,
          y: this.camera.target.y,
          z: this.camera.target.z,
        },
      },
      fragmentMap: { ...fragmentMapToJSON(this.fragmentMap) },
    });
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
        //console.log("Fragments are not found, check if the model is uploaded.");
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

    //last check before creating card
    await updateDocument("/todos", this.taskId, { status: this.status });
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
    return this.status;
  }

  async setDeadline(date: Date) {
    this.deadline = date;
    await updateDocument("/todos", this.taskId, { deadline: this.deadline });
    this.checkStatus();
  }

  getStatus() {
    return this.status;
  }

  edit(task: string, priority: ToDoPriority) {
    this.task = task;
    this.priority = priority;
    this.onEdit({ task, priority });
  }

  setStatus(status: ToDoStatus) {
    this.status = status;
  }

  async toggleStatus(status: ToDoStatus) {
    if (status === "active") return this.setStatus("completed");
    if (status === "completed") {
      if (this.deadline < new Date()) {
        return this.setStatus("overdue");
      } else {
        return this.setStatus("active");
      }
    }
    if (status === "overdue") {
      //console.log("note to self: add a date input or delete task options here. for now deadline is updated to 1 month from today!");
      return await this.setDeadline(monthsAfterToday(1));
    }
  }
}
