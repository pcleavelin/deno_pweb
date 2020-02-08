import { Pweb } from "../../mod.ts";

new Pweb()
	.get("/hello/<name>", (name: string) => `Hello ${name}`)
	.start({ port: 8000 });