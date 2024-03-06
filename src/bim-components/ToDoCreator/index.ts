import * as OBC from "openbim-components";
import { styleItUp } from "../../../src/index.ts";
import { TodoCards } from "./src/TodoCards.ts";

interface ToDo {
  description: string;
  date: Date;
  fragmentMap: OBC.FragmentIdMap;
}

export class TodoCreator extends OBC.Component<ToDo[]> implements OBC.UI {
  static uuid = "0e9b30b7-2500-48c0-b586-12ac5c991f82 ";
  enabled: boolean = true;
  uiElement: OBC.UIElement<any> = new OBC.UIElement<{
    activationButton: OBC.Button;
    todoList: OBC.FloatingWindow;
  }>();
  private _components: OBC.Components;
  private _list: ToDo[];

  constructor(components: OBC.Components) {
    super(components);
    this._components = components;
    components.tools.add(TodoCreator.uuid, this);
    this.setUI();
  }

  private setUI() {
    const activationButton = new OBC.Button(this._components);
    activationButton.tooltip = "To-Do";
    activationButton.materialIcon = "construction";

    const form = new OBC.Modal(this._components);
    this._components.ui.add(form);
    form.title = "Create New To-Do";
    form.domElement.style.background = "#c3b7ac";
    form.slots.actionButtons.get().style.color = "black";
    form.innerElements.title.style.color = "black";
    form.domElement.style.opacity = "0.9";
    form.domElement.style.padding = "30px";
    form.domElement.style.borderRadius = "50px 15px";

    const modalDiv = form.slots.content.get().parentElement as HTMLElement;
    modalDiv.style.width = "fit-content";
    form.slots.content.get().style.display = "flex";
    form.slots.content.get().style.flexDirection = "column";
    form.slots.content.get().style.rowGap = "20px";

    const descriptionInput = new OBC.TextArea(this._components);
    descriptionInput.label = "Description";
    descriptionInput.get().style.width = "fit-content";
    descriptionInput.innerElements.input.style.width = "300px";
    descriptionInput.innerElements.input.style.color = "black";
    descriptionInput.innerElements.label.style.color = "black";
    form.slots.content.addChild(descriptionInput);

    const input = new OBC.CheckboxInput(this._components);
    form.slots.content.addChild(input);

    form.onCancel.add(() => {
      form.visible = false;
    });

    form.onAccept.add(() => {
      this.addTodo(descriptionInput.value);
      descriptionInput.value = "";
      form.visible = false;
    });

    const showTodoBtn = new OBC.Button(this._components, {
      name: "Show",
      tooltip: "To-Do List",
    });
    showTodoBtn.materialIcon = "list_alt";
    showTodoBtn.onClick.add(() => {
      todoList.visible ? (todoList.visible = false) : (todoList.visible = true);
    });

    const newTodoBtn = new OBC.Button(this._components, {
      name: "Create",
      tooltip: "New To-Do",
    });
    newTodoBtn.materialIcon = "list_alt_add";
    newTodoBtn.onClick.add(() => {
      form.visible = true;
    });

    activationButton.addChild(showTodoBtn, newTodoBtn);

    const todoList = new OBC.FloatingWindow(this._components);
    this._components.ui.add(todoList);
    todoList.visible = false;
    todoList.title = "To-Do List";

    this.uiElement.set({ activationButton, todoList });
  }

  get(): ToDo[] {
    return this._list;
  }

  async addTodo(description: string) {
    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    const todo: ToDo = {
      description,
      date: new Date(),
      fragmentMap: highlighter.selection.select,
    };
    const todoCard = new TodoCards(this._components);
    const todoList = this.uiElement.get("todoList");
    todoList.addChild(todoCard);
    console.log(todo);
  }
}
