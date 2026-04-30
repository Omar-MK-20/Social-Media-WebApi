import express from 'express';
import { bootstrap } from "./app.bootstrap.js";

const app = express();
await bootstrap(app);

export default app;