import * as OBC from "openbim-components";
import { FragmentsGroup } from "bim-fragment";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./react-components/App";
import { TodoCreator } from "./bim-components/TodoCreator";
import { SimpleQto } from "./bim-components/SimpleQto";

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(<App />);
