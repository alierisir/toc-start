type Trigger = "click" | "mouseenter" | "mouseleave";

export interface IButton {
  text: string;
  htmlElement: HTMLElement;
  trigger: Trigger;
  action: Function;
}

export class CustomButton implements IButton {
  text: string = "button";
  htmlElement: HTMLButtonElement;
  trigger: Trigger = "click";
  action: Function = () => {
    console.log("this button has no function.");
  };

  constructor(id: string) {
    this.configureElement(id);
  }

  configureElement(id: string) {
    let element = document.getElementById(id) as HTMLButtonElement;
    if (element && element instanceof HTMLButtonElement) {
      this.htmlElement = element;
    } else {
      element = document.createElement("button");
      element.id = id;
      this.htmlElement = element;
    }
  }
}
