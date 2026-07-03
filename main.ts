import { App, staticFiles } from "fresh";

export const app = new App<State>();

app.use(staticFiles());

// Include file-system based routes here
app.fsRoutes();
