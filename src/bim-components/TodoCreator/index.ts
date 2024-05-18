import { ToDo, TodoPriority } from "./src/ToDo";
import * as OBC from "openbim-components";
import * as THREE from "three";

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

  updateList() {
    const updated: ToDo[] = [];
    this._list.map((item) => {
      if (item.enabled) updated.push(item);
    });
    this._list = updated;
  }

  async addTodo(description: string, priority: TodoPriority) {
    if (!this.enabled) return console.warn("ToDo Creator is disabled!");
    const todo = new ToDo(this._components, description, priority);

    const list = this.get();
    list.push(todo);
    console.log(list);

    console.log(todo);

    const todoCard = todo.card;

    const todoList = this.uiElement.get("todoList");

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
