import * as OBC from "openbim-components";
import { TodoCard } from "./src/TodoCard";
import * as THREE from "three";

type TodoPriority = "Low" | "Normal" | "High";

interface ToDo {
  id: string;
  description: string;
  date: Date;
  fragmentMap: OBC.FragmentIdMap;
  camera: { position: THREE.Vector3; target: THREE.Vector3 };
  priority: TodoPriority;
}

export class TodoCreator
  extends OBC.Component<ToDo[]>
  implements OBC.UI, OBC.Disposable
{
  static uuid = "3e76b69b-febc-45f8-a9ed-44c466b0cbb2";
  onProjectCreated = new OBC.Event<ToDo>();
  enabled = true;
  private _components: OBC.Components;
  private _list: ToDo[] = [];
  uiElement = new OBC.UIElement<{
    activationButton: OBC.Button;
    todoList: OBC.FloatingWindow;
  }>();

  constructor(components: OBC.Components) {
    super(components);
    this._components = components;
    components.tools.add(TodoCreator.uuid, this);
    this.setUi();
  }

  async dispose() {
    this.uiElement.dispose();
    this._list = [];
    this.enabled = false;
  }

  async setup() {
    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    highlighter.add(`${TodoCreator.uuid}-priority-Low`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4be973) }),
    ]);
    highlighter.add(`${TodoCreator.uuid}-priority-Normal`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4bb0e9) }),
    ]);
    highlighter.add(`${TodoCreator.uuid}-priority-High`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0xe94b4b) }),
    ]);
  }

  deleteTodo(todo: ToDo) {
    const remaining: ToDo[] = [];
    this._list.map((item) => {
      if (item.id !== todo.id) remaining.push(item);
    });
    this._list = remaining;
  }

  getTodo(id: string) {
    const todo = this._list.map((todo) => {
      return todo.id === id ? todo : null;
    });
    return todo;
  }

  async addTodo(description: string, priority: TodoPriority) {
    if (!this.enabled) return console.warn("ToDo Creator is disabled!");
    //Get camera and target positions
    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
      throw new Error(
        "ToDo creator needs an orthoperspective camera in order to work!"
      );
    }
    const position = new THREE.Vector3();
    camera.controls.getPosition(position);
    const target = new THREE.Vector3();
    camera.controls.getTarget(target);

    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );

    const todo: ToDo = {
      id: OBC.generateIfcGUID(),
      description,
      date: new Date(),
      fragmentMap: highlighter.selection.select,
      camera: { position, target },
      priority,
    };

    const list = this.get();
    list.push(todo);
    console.log(list);

    const todoCard = new TodoCard(this._components);
    todoCard.description = todo.description;
    todoCard.date = todo.date;

    const deleteButton = new OBC.Button(this._components);
    deleteButton.materialIcon = "delete";

    todoCard.slots.actionButtons.addChild(deleteButton);
    deleteButton.onClick.add(async () => {
      this.deleteTodo(todo);
      await todoCard.dispose();
    });

    const copyButton = new OBC.Button(this._components);
    copyButton.materialIcon = "content_copy";

    todoCard.slots.actionButtons.addChild(copyButton);
    copyButton.onClick.add(async () => {
      await this.addTodo(todo.description, todo.priority);
    });

    const todoList = this.uiElement.get("todoList");

    todoCard.onCardClick.add(() => {
      if (Object.keys(todo.fragmentMap).length === 0) return;
      highlighter.highlightByID("select", todo.fragmentMap);
      camera.controls.setLookAt(
        todo.camera.position.x,
        todo.camera.position.y,
        todo.camera.position.z,
        todo.camera.target.x,
        todo.camera.target.y,
        todo.camera.target.z,
        true
      );
    });
    todoList.addChild(todoCard);
    this.onProjectCreated.trigger(todo);
  }

  private async setUi() {
    const activationButton = new OBC.Button(this._components);
    activationButton.materialIcon = "construction";
    activationButton.tooltip = "ToDo's";

    const createTodoBtn = new OBC.Button(this._components, {
      name: "Create",
      materialIconName: "add",
    });

    const showTodoBtn = new OBC.Button(this._components, {
      name: "To-Do List",
      materialIconName: "list_alt",
    });

    activationButton.addChild(createTodoBtn, showTodoBtn);

    const todoList = new OBC.FloatingWindow(this._components);
    todoList.title = "Todo List";
    this._components.ui.add(todoList);
    todoList.visible = false;

    const todoListToolbar = new OBC.SimpleUIComponent(this._components);
    todoList.addChild(todoListToolbar);

    const colorizeBtn = new OBC.Button(this._components);
    colorizeBtn.materialIcon = "format_color_fill";
    todoListToolbar.addChild(colorizeBtn);

    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    colorizeBtn.onClick.add(() => {
      colorizeBtn.active = !colorizeBtn.active;
      if (colorizeBtn.active) {
        for (const todo of this._list) {
          const fragmentMapLength = Object.keys(todo.fragmentMap).length;
          if (fragmentMapLength === 0) {
            return;
          }
          highlighter.highlightByID(
            `${TodoCreator.uuid}-priority-${todo.priority}`,
            todo.fragmentMap
          );
        }
      } else {
        highlighter.clear(`${TodoCreator.uuid}-priority-Low`);
        highlighter.clear(`${TodoCreator.uuid}-priority-Normal`);
        highlighter.clear(`${TodoCreator.uuid}-priority-High`);
      }
    });

    showTodoBtn.onClick.add(() => {
      todoList.visible = true;
    });

    const form = new OBC.Modal(this._components);
    this._components.ui.add(form);
    form.title = "Create New To-Do";

    const descriptionInput = new OBC.TextArea(this._components);
    descriptionInput.label = "Description";
    form.slots.content.addChild(descriptionInput);
    form.slots.content.get().style.padding = "20px";
    form.slots.content.get().style.display = "flex";
    form.slots.content.get().style.flexDirection = "column";
    form.slots.content.get().style.rowGap = "20px";

    const priorityDropdown = new OBC.Dropdown(this._components, "Priority");
    priorityDropdown.addOption("Low", "Normal", "High");
    priorityDropdown.value = "Normal";
    form.slots.content.addChild(priorityDropdown);

    form.onAccept.add(() => {
      this.addTodo(
        descriptionInput.value,
        priorityDropdown.value as TodoPriority
      );
      descriptionInput.value = "";
      priorityDropdown.value = "Normal";
      form.visible = false;
    });

    form.onCancel.add(() => {
      form.visible = false;
    });

    createTodoBtn.onClick.add(() => {
      form.visible = true;
    });

    this.uiElement.set({ activationButton, todoList });
  }

  get(): ToDo[] {
    return this._list;
  }
}
