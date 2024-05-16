import * as OBC from "openbim-components";

export class QtoQuery extends OBC.SimpleUIComponent {
  slots: {
    details: OBC.SimpleUIComponent;
  };

  set title(value: string) {
    const titleElement = this.getInnerElement("title") as HTMLParagraphElement;
    titleElement.textContent = value;
  }

  constructor(components: OBC.Components) {
    const template = `
    <div>
        <p id="title">Title Goes Here</p>
        <div data-tooeen-slot="details">Details Goes Here</div>
    </div>
    `;
    super(components, template);
    this.setSlot("details", new OBC.SimpleUIComponent(this._components));
  }
}
