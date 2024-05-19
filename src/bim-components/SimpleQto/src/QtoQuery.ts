import * as OBC from "openbim-components";

export class QtoQuery extends OBC.SimpleUIComponent {
  slots: {
    qtoName: OBC.SimpleUIComponent;
  };

  set setName(value: string) {
    const setNameElement = this.getInnerElement(
      "setName"
    ) as HTMLParagraphElement;
    setNameElement.textContent = value;
  }

  constructor(components: OBC.Components) {
    const template = `
    <div>
        <p id="setName">Title Goes Here</p>
        <div data-tooeen-slot="qtoName">Details Goes Here</div>
    </div>
    `;
    super(components, template);
    this.setSlot("qtoName", new OBC.SimpleUIComponent(this._components));
  }
}
