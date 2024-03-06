import * as OBC from "openbim-components";

export class TodoCards<HTMLElement> extends OBC.SimpleUIComponent {
  constructor(components: OBC.Components) {
    const template = `<div class="list-item todo-active" style="    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding: 10px;
    align-items: center;
    color: black;
    border-radius:10px">
        <p todo-list-functions="toggle-active"><span class="material-symbols-outlined">
        check_box_outline_blank
        </span></p>
        <p>This is the description</p>
        <p>This is the as string</p>
        </div>`;
    super(components, template);
  }
}
