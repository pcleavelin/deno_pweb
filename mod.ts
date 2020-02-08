import { serve, ServerRequest } from "https://deno.land/std@v0.30.0/http/server.ts";

const s = serve({ port: 8000 });

console.log("http://localhost:8000/");

class WebRoute {
	url: string;
	handler: Function;

	constructor(url: string, handler: Function) {
		this.url = url;
		this.handler = handler;
	}
}

class Router {
	routes: Array<WebRoute>;

	constructor() {
		this.routes = [];
	}

	public add_route(url: string, handler: Function) {
		this.routes.push(new WebRoute(url, handler));
	}

	public async route_request(req: ServerRequest) {
		// console.log(req);

		console.log(`\n\nUrl: ${req.url}`);

		let url = req.url;
		if (url[url.length - 1] === '/') {
			url = url.substring(0, url.length - 1);
		}

		let num_paths = url.split('/').length - 1;
		let arg_patt = /\<[a-zA-Z]+\>/;

		console.log(`Number of paths: ${num_paths}`)

		let final_args = [];
		let final_route_args = [];

		let route = this.routes.find(route => {
			let args_begin = route.url.split('<');

			console.log(`Raw args: ${args_begin}`);

			let args = [];

			args_begin.forEach(arg => {
				let end_index = arg.indexOf('>');

				let str = arg.substring(0, end_index);

				if (str !== "") {
					args.push(str);
				}
			})

			final_route_args = args;

			console.log(`Args: ${JSON.stringify(args)}`);

			if ((route.url.split('/').length-1) !== num_paths) {
				return false;
			} 
			else {
				console.log("Same number of paths!");

				let arg_values = [];

				let req_index = 0;
				let route_index = -1;

				for (let i = 0; i < url.length; i++) {
					route_index += 1;
					if (url[i] === route.url[route_index]) {
						continue;
					}
					else if (url[i] !== route.url[route_index]) {
						if (route.url[route_index] === '<') {
							let end_arg_index = route.url.indexOf('>', route_index);

							let end_url_index = url.indexOf('/', i);
							if (end_url_index === -1) {
								end_url_index = url.length;
							}

							arg_values.push(url.substring(i, end_url_index));
							console.log(`Got arg: ${arg_values[arg_values.length-1]}`);

							route_index = end_arg_index+1;
							i = end_url_index;
						} else {
							return false;
						}
					}
				}

				final_args = arg_values;

				return true;
			}
		});

		if (route !== undefined) {
			let route_params = {};

			final_route_args.forEach((arg, index) => {
				route_params[arg] = final_args[arg] = final_args[index];
			});

			try {
				route.handler(req, route_params);
			} catch (err) {
				req.respond({ status: 500, body: err.message });
			}
		} else {
			req.respond({ status: 404, body: "404 - Not Found\n" });
		}
	}
}

let router = new Router();

router.add_route("/", (req) => {
	req.respond({ body: "Home\n" });
});

router.add_route("/<name>/hello/<greeting>", (req, args: { name: string, greeting: string }) => {
	let { name, greeting } = args;
	req.respond({ body: `${greeting} ${name}` });
});

router.add_route("/<name>/bye/<farewell>", (req, args: { name: string, farewell: string }) => {
	let { name, farewell } = args;
	req.respond({ body: `${farewell} ${name}` });
});

for await (const req of s) {
	router.route_request(req);
}