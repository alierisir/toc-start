import { TodoCard } from "./src/TodoCard";
import * as OBC from "openbim-components";
import * as THREE from "three";
import { IToDo, ToDo, ToDoPriority, ToDoStatus } from "./src/ToDo";
import { generateUUID } from "three/src/math/MathUtils.js";
import { Project } from "../../classes/Project";
import * as Firestore from "firebase/firestore";
import { getCollection } from "../../firebase";

export class TodoCreator
  extends OBC.Component<ToDo[]>
  implements OBC.UI, OBC.Disposable
{
  static uuid = "3e76b69b-febc-45f8-a9ed-44c466b0cbb2";
  onToDoCreated = new OBC.Event<ToDo>();
  enabled = true;
  activeProject: Project;
  private _components: OBC.Components;
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
    this.enabled = false;
  }

  async setup(project: Project) {
    this.activeProject = project;
    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    highlighter.add(`${TodoCreator.uuid}-priority-low`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4be973) }),
    ]);
    highlighter.add(`${TodoCreator.uuid}-priority-normal`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4bb0e9) }),
    ]);
    highlighter.add(`${TodoCreator.uuid}-priority-high`, [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0xe94b4b) }),
    ]);
    //console.log("ToDoCreator setup is successfully completed: ", this);
  }

  async createExistingCard(
    todo: ToDo,
    highlighter: OBC.FragmentHighlighter,
    camera: OBC.OrthoPerspectiveCamera
  ) {
    const list = this.activeProject.getToDoList();
    const card = new TodoCard(this._components);
    todo.card = card;
    todo.card.description = todo.task;
    todo.card.date = todo.deadline;
    todo.card.priority = todo.priority;
    todo.card.onCardClick.add(async () => {
      await camera.fit();
      try {
        await highlighter.highlightByID("select", todo.fragmentMap);
      } catch (error) {
        console.log("To-do has no fragments assigned.");
      }
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
    const deleteButton = new OBC.Button(this._components);
    deleteButton.materialIcon = "delete";

    todo.card.slots.actionButtons.addChild(deleteButton);
    deleteButton.onClick.add(() => {
      todo.dispose();
    });
    const listUi = this.uiElement.get("todoList");
    listUi.addChild(todo.card);
  }

  deleteTodo(id: string) {
    this.activeProject.removeToDo(id); // Remove todo ile değiştirilmeli
  }

  getTodo(id: string) {
    return this.get().find((todo) => todo.taskId === id);
  }

  idIsValid(id: string) {
    const idList = this.activeProject.getToDoList().map((todo) => todo.taskId);
    return !idList.includes(id);
  }

  updateList() {
    const updated: ToDo[] = [];
    const list = this.activeProject.getToDoList();
    list.map((item) => {
      if (item.enabled) {
        updated.push(item);
      } else {
        console.log(`Task:${item.taskId} is removed from the list.`);
      }
    });
    this.activeProject.updateToDoList(updated);
  }

  addTodo(data: IToDo, taskId?: string) {
    if (!this.enabled) throw new Error("ToDo Creator is not enabled");
    const todo = new ToDo(this._components, data, taskId);
    if (!this.idIsValid(todo.taskId)) throw new Error("Task id is invalid");
    const todoCard = todo.card;
    //Store Data
    this.activeProject.newToDo(todo);
    //Store UI
    const todoList = this.uiElement.get("todoList");
    todoList.addChild(todoCard);
    //Load event
    //console.log(this._list);
    this.onToDoCreated.trigger(todo);
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
    todoList.title = `Todo List`;
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
      const foundTodos = this.get().filter((todo) =>
        todo.task.toLowerCase().includes(searchText.value.toLowerCase())
      );
      this.get().map((todo) => {
        todo.card.visible = false;
      });
      foundTodos.map((foundTodo) => {
        foundTodo.card.visible = true;
      });
    });

    todoListToolbar.addChild(searchText);

    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    colorizeBtn.onClick.add(() => {
      colorizeBtn.active = !colorizeBtn.active;
      if (colorizeBtn.active) {
        for (const todo of this.activeProject.getToDoList()) {
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
        highlighter.clear(`${TodoCreator.uuid}-priority-low`);
        highlighter.clear(`${TodoCreator.uuid}-priority-normal`);
        highlighter.clear(`${TodoCreator.uuid}-priority-high`);
      }
    });

    showTodoBtn.onClick.add(() => {
      if (!this.activeProject) throw new Error("No active project found!");
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

    form.onAccept.add(async () => {
      const todosCollection = getCollection("/todos");
      const data: IToDo = {
        task: descriptionInput.value,
        projectId: this.activeProject.id,
        priority: priorityDropdown.value?.toLowerCase() as ToDoPriority,
      };
      const doc = await Firestore.addDoc(todosCollection, data);
      this.addTodo(data, doc.id);
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
    return this.activeProject.getToDoList();
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

  getProjectToDosById(projectId: string) {
    return this.get().filter((todo) => todo.projectId === projectId);
  }

  getProjectToDos() {
    return this.get().filter(
      (todo) => todo.projectId === this.activeProject.id
    );
  }

  getToDo(taskId: string) {
    const todo = this.activeProject.getToDoList().find((item) => {
      item.taskId === taskId;
    });
    if (!todo) throw new Error(`TodoCreator: TaskId "${taskId}" is not found`);
    return todo;
  }

  changeStatus(taskId: string, status: ToDoStatus) {
    try {
      const todo = this.getToDo(taskId);
      todo.setStatus(status);
      todo.checkStatus();
    } catch (error) {
      console.log(error, " Status change failed");
    }
  }

  updateToDo(taskId: string, data: Partial<ToDo>) {
    try {
      const todo = this.getToDo(taskId);
      const keys = Object.keys(data);
      for (const key of keys) {
        todo[key] = data[key];
      }
    } catch (error) {
      console.log(error, " Update Failed!");
    }
  }

  filterProjectTodos(value: string) {
    const projectTodos = this.get().filter(
      (todo) => todo.projectId === this.activeProject.id
    );
    return projectTodos.filter((todo) =>
      todo.task.toLowerCase().includes(value.toLowerCase())
    );
  }
}
