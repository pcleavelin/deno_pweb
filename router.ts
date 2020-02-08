import { ServerRequest } from "https://deno.land/std@v0.30.0/http/server.ts";

export class WebRoute {
	url: string;
	handler: Function;

	constructor(url: string, handler: Function) {
		this.url = url;
		this.handler = handler;
	}
}

export class Router {
	routes: Array<WebRoute>;

	constructor() {
		this.routes = [];
	}

	private extract_route_params(url: string): string[] {
		let args_begin = url.split('<');
		let args = [];

		args_begin.forEach(arg => {
			let end_index = arg.indexOf('>');

			let str = arg.substring(0, end_index);

			if (str !== "") {
				args.push(str);
			}
		})

		return args;
	}

	private validate_and_parse_route_args(url: string, route_url: string): string[] {
		let arg_values = [];
		let req_index = 0;
		let route_index = -1;

		for (let i = 0; i < url.length; i++) {
			route_index += 1;
			if (url[i] === route_url[route_index]) {
				continue;
			}
			else if (url[i] !== route_url[route_index]) {
				if (route_url[route_index] === '<') {
					let end_arg_index = route_url.indexOf('>', route_index);

					let end_url_index = url.indexOf('/', i);
					if (end_url_index === -1) {
						end_url_index = url.length;
					}

					arg_values.push(url.substring(i, end_url_index));

					route_index = end_arg_index+1;
					i = end_url_index;
				} else {
					return null;
				}
			}
		}

		return arg_values;
	}

	private validate_route_args(route: WebRoute, route_args: string[]) {
		let handler_str = route.handler.toString();
		handler_str = handler_str.slice(handler_str.indexOf('(')+1, handler_str.indexOf(')'));

		let params = handler_str.split(',').map(param => param.trim());

		if (params.length !== route_args.length) {
			throw new Error(`mismatched route parameters: Found ${params.length} parameters, expected ${route_args.length}`);
		}

		route_args.forEach((arg, index) => {
			if(arg !== params[index]) {
				throw new Error(`mismatched route parameter: Found '${params[index]}', expected '${arg}'`);
			}
		});
	}

	public add_route(url: string, handler: Function) {
		this.routes.push(new WebRoute(url, handler));
	}

	public async route_request(req: ServerRequest) {
		console.log(`Url: ${req.url}`);

		let url = req.url;
		if (url[url.length - 1] === '/') {
			url = url.substring(0, url.length - 1);
		}

		let num_paths = url.split('/').length - 1;
		let final_args = [];
		let final_route_args = [];

		let route = this.routes.find(route => {
			final_route_args = this.extract_route_params(route.url);

			if ((route.url.split('/').length-1) !== num_paths) {
				return false;
			} 
			else {
				final_args = this.validate_and_parse_route_args(url, route.url);

				return final_args === null ? false : final_args;
			}
		});

		if (route !== undefined) {
			this.validate_route_args(route, final_route_args);

			try {
				let response = route.handler(...final_args);

				req.respond({ body: response });
			} catch (err) {
				req.respond({ status: 500, body: err.message });
			}
		} else {
			req.respond({ status: 404, body: "404 - Not Found\n" });
		}
	}
}