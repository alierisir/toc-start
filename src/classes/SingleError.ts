export type ErrorHeader = "Input Error" | "Type Error" | "Logic Error";

export interface ISingleError {
  code: string;
  header: ErrorHeader;
  text: string;
}

export class SingleError implements ISingleError {
  code: string;
  header: ErrorHeader;
  text: string;
  ui: HTMLDivElement;

  constructor(code: string, text: string, header: ErrorHeader) {
    this.code = code;
    this.text = text;
    this.header = header;
    this.setUi();
  }

  setUi() {
    this.ui = document.createElement("div");
    this.ui.className = "modal-container";
    this.ui.style.padding = "0.5rem";
    this.ui.style.borderRadius = "5px 25px";
    this.ui.style.userSelect = "none";
    this.ui.innerHTML = `<h2 class="modal-header">
    EC:${this.code} - ${this.header} 
</h2>
<p class="project-details">
    ${this.text}
</p>
    `;
  }
}

const ErrorDictionary: ISingleError[] = [
  { code: "001", header: "Input Error", text: "variable" },
];
