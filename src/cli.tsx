import React from "react";
import { render } from "ink";
import MainApp, { parseMainAppArgs } from "./main.js";

const mainProps = parseMainAppArgs(process.argv.slice(2));

render(React.createElement(MainApp, mainProps));
