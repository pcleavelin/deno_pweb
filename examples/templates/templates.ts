import { Pweb } from '../../mod.ts';

new Pweb()
	.page('/', 'base_page.html', {
		title: "Home Page",
		engine: {
			name: "Templar"
		},
		mylink: {
			url: "/about",
			name: "About Page"
		}
	})
	.page('/about', 'base_page.html', {
		title: "About Page",
		engine: {
			name: "Templar"
		},
		mylink: {
			url: "/",
			name: "Home Page"
		}
	})
	.start({ port: 8000 });