import { SingleError, ISingleError } from "./SingleError";

export class ErrorManager {
  ui: HTMLDialogElement;

  constructor(container: HTMLDialogElement) {
    this.ui = container;
  }

  newError(errDef: ISingleError) {
    const err = new SingleError(errDef.code, errDef.text, errDef.header);
    this.ui.append(err.ui);
    this.ui.showModal();
    this.ui.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.ui.removeChild(err.ui);
      }
    });
  }
}
