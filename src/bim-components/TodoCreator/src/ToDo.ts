import * as OBC from "openbim-components";
import { generateUUID } from "three/src/math/MathUtils.js";
import * as THREE from "three";
import { TodoCard } from "./TodoCard";
import { TodoCreator } from "..";

export type TodoPriority = "Low" | "Normal" | "High";

export class ToDo extends OBC.Component<ToDo> implements OBC.Disposable {
  enabled: boolean = true;
  private _components: OBC.Components;
  //Own Properties
  id: string = generateUUID();
  description: string;
  date: Date = new Date();
  priority: TodoPriority;
  camera: { position: THREE.Vector3; target: THREE.Vector3 } = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
  };
  fragmentMap: OBC.FragmentIdMap;
  card: TodoCard;

  constructor(
    components: OBC.Components,
    description: string,
    priority: TodoPriority
  ) {
    super(components);
    this._components = components;
    this.description = description;
    this.priority = priority;
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
    this.card.description = this.description;
    this.card.date = this.date;
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
    this.card.enabled = false;
    await this.card.dispose();
    this.enabled = false;
    creator.updateList();
  }
}
