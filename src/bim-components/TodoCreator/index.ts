import { ToDo } from "./src/ToDo";
import * as OBC from "openbim-components";
import * as THREE from "three";
import { IToDo, ToDoPriority, ToDoStatus } from "../../classes/ToDo";
import { generateUUID } from "three/src/math/MathUtils.js";
import { monthsAfterToday } from "../../classes/CustomFunctions";

export class TodoCreator extends OBC.Component<ToDo[]> implements OBC.UI, OBC.Disposable {
  static uuid = "3e76b69b-febc-45f8-a9ed-44c466b0cbb2";
  onProjectCreated = new OBC.Event<ToDo>();
  onProjectDeleted = new OBC.Event<string>();
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
    const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
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

  async deleteTodo(id: string) {
    const todo = this.getTodo(id);
    if (!todo) return console.log(`there no todo with the id of ${id} `);
    await todo.dispose();
    this.onProjectDeleted.trigger(id);
  }

  getTodo(id: string) {
    return this.get().find((todo) => todo.taskId === id);
  }

  updateList() {
    const updated: ToDo[] = [];
    this._list.map((item) => {
      if (item.enabled) {
        updated.push(item);
      } else {
        console.log(`Task:${item.taskId} is removed from the list.`);
      }
    });
    this._list = updated;
  }

  async addTodo(data: IToDo, id: string = generateUUID()) {
    if (!this.enabled) return console.warn("ToDo Creator is disabled!");
    const todo = new ToDo(this._components, data, id);
    const todoCard = todo.card;
    //Store Date
    const list = this.get();
    list.push(todo);
    //Store UI
    const todoList = this.uiElement.get("todoList");
    todoList.addChild(todoCard);
    //Load event
    this.onProjectCreated.trigger(todo);
    return todo;
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
    todoListToolbar.get().style.display = "flex";
    todoListToolbar.get().style.alignItems = "center";
    todoListToolbar.get().style.columnGap = "15px";

    const colorizeBtn = new OBC.Button(this._components);
    colorizeBtn.materialIcon = "format_color_fill";
    todoListToolbar.addChild(colorizeBtn);

    const searchText = new OBC.TextInput(this._components);
    searchText.label = "";
    searchText.domElement.addEventListener("input", () => {
      const foundTodos = this.get().filter((todo) => todo.task.toLowerCase().includes(searchText.value.toLowerCase()));
      this.get().map((todo) => {
        todo.card.visible = false;
      });
      foundTodos.map((foundTodo) => {
        foundTodo.card.visible = true;
      });
    });

    todoListToolbar.addChild(searchText);

    const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
    colorizeBtn.onClick.add(() => {
      colorizeBtn.active = !colorizeBtn.active;
      if (colorizeBtn.active) {
        for (const todo of this._list) {
          const fragmentMapLength = Object.keys(todo.fragmentMap).length;
          if (fragmentMapLength === 0) {
            return;
          }
          highlighter.highlightByID(`${TodoCreator.uuid}-priority-${todo.priority}`, todo.fragmentMap);
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

    const statusDropdown = new OBC.Dropdown(this._components, "Status");
    statusDropdown.addOption("Active", "Completed", "Overdue");
    statusDropdown.value = "Normal";
    form.slots.content.addChild(statusDropdown);

    const priorityDropdown = new OBC.Dropdown(this._components, "Priority");
    priorityDropdown.addOption("Low", "Normal", "High");
    priorityDropdown.value = "Normal";
    form.slots.content.addChild(priorityDropdown);

    form.onAccept.add(async () => {
      const data: IToDo = {
        task: descriptionInput.value,
        status: statusDropdown.value?.toLowerCase() as ToDoStatus,
        priority: priorityDropdown.value?.toLowerCase() as ToDoPriority,
        deadline: monthsAfterToday(1),
      };
      const todo = await this.addTodo(data);
      descriptionInput.value = "";
      priorityDropdown.value = "Normal";
      statusDropdown.value = "Active";
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

  get fragmentQty() {
    const mapped = this.get().map((todo) => {
      const id = todo.taskId;
      const fragments = todo.fragmentMap;
      const item = {};
      let count = 0;
      for (const value of Object.values(fragments)) {
        count += value.size;
      }
      item[id] = count;
      return item;
    });
    console.log(mapped);
    return mapped;
  }
}
