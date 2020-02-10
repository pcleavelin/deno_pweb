import { serve, ServerRequest } from "https://deno.land/std@v0.30.0/http/server.ts";

import { Router } from './router.ts';
import { Templar } from './templar.ts';

export interface PwebConfig {
	port: number;
}

export class Pweb {
	router: Router;

	constructor() {
		this.router = new Router();
	}

	public get(url: string, handler: Function): Pweb {
		this.router.add_route(url, handler);

		return this;
	}

	public page(url: string, template: string, values: Object): Pweb {
		Deno.readFile(template).then(content => {
			const decoder = new TextDecoder("utf-8");
			const text = decoder.decode(content);
	
			const html = Templar.render(text, values);

			this.router.add_route(url, (req) => {
				req.respond({ body: html });
			});
		});

		return this;
	}

	public async start(config: PwebConfig) {
		const s = serve(config);

		console.log(`Started webserver on port ${config.port}`);

		for await (const req of s) {
			this.router.route_request(req);
		}
	}
}