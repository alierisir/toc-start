import * as OBC from "openbim-components";
import { generateUUID } from "three/src/math/MathUtils.js";
import * as THREE from "three";
import { TodoCard } from "./TodoCard";
import { TodoCreator } from "..";
import { IToDo, ToDoPriority, ToDoStatus } from "../../../classes/ToDo";

export class ToDo extends OBC.Component<ToDo> implements OBC.Disposable, IToDo {
  enabled: boolean = true;
  private _components: OBC.Components;
  //Own Properties
  taskId: string;
  task: string;
  deadline: Date = new Date();
  priority: ToDoPriority;
  status: ToDoStatus;
  projectId: string;
  camera: { position: THREE.Vector3; target: THREE.Vector3 } = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
  };
  fragmentMap: OBC.FragmentIdMap;
  card: TodoCard;

  constructor(components: OBC.Components, data: IToDo, id: string = generateUUID()) {
    super(components);
    this._components = components;
    this.taskId = id;
    this.projectId = data.projectId;
    this.task = data.task;
    this.priority = data.priority;
    this.setup();
    this.createCard();
  }

  private async setup() {
    const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera)) return console.warn("OrthoPerspective Camera is not found!");
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
    this.card.task = this.task;
    this.card.deadline = this.deadline;
    this.card.priority = this.priority;

    const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);

    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera))
      return console.warn("This operation requires an active OrthoPerspective Camera");

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
    this.card.enabled = false;
    await this.card.dispose();
    this.enabled = false;
    creator.updateList();
  }
}
