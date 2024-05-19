import * as OBC from "openbim-components";

export class TodoCard extends OBC.SimpleUIComponent {
  onCardDeleted = new OBC.Event<string>();
  onCardClick = new OBC.Event();
  slots: {
    actionButtons: OBC.SimpleUIComponent;
  };

  set priority(value: string) {
    const priorityElement = this.getInnerElement(
      "priority"
    ) as HTMLParagraphElement;
    priorityElement.textContent = value;
  }

  set visible(value: boolean) {
    value
      ? (this.get().style.display = "flex")
      : (this.get().style.display = "none");
  }

  set description(value: string) {
    const descriptionElement = this.getInnerElement(
      "description"
    ) as HTMLParagraphElement;
    descriptionElement.textContent = value;
  }
  set date(value: Date) {
    const dateElement = this.getInnerElement("date") as HTMLParagraphElement;
    dateElement.textContent = value.toDateString();
  }

  constructor(components: OBC.Components) {
    const template = `
    <div class="todo-list-item" style="display:flex;justify-content: space-between;align-items: center;color:var(--primary-color); border:1px solid var(--primary-color); border-radius:10px; padding:10px">
      <div style="display:flex;justify-content: space-between;align-items: center">
        <p id="materialIcon" todo-list-functions="toggle-active" style="padding:5px 15px 5px 5px"><span class="material-symbols-outlined">
          handyman
          </span>
        </p>
        <div>
          <div style="opacity: 0.6; font-size: 0.7rem; display: flex; column-gap: 15px">
            <p id="date">DATE GOES HERE</p>
            <p id="priority">PRIORITY GOES HERE</p>
          </div>
          <p id="description">TASK GOES HERE</p>
        </div>
      </div>
      <div data-tooeen-slot="actionButtons" style="display:flex" ></div>
    </div>`;
    super(components, template);
    this.get().addEventListener("click", () => {
      this.onCardClick.trigger();
    });
    this.setSlot("actionButtons", new OBC.SimpleUIComponent(this._components));
    this.slots.actionButtons.domElement.style.display = "flex";
  }
}
