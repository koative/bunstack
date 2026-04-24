import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));

export default {
	port: 1002,
	fetch: app.fetch,
};
