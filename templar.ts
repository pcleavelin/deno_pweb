// Taken from: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
function objFromStr(obj, str) {
    str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    str = str.replace(/^\./, '');           // strip a leading dot

    var properties = str.split('.');

    for (var i = 0, n = properties.length; i < n; ++i) {
        var k = properties[i];
        if (k in obj) {
            obj = obj[k];
        } else {
            return;
        }
    }
    return obj;
}

export class Templar {
	public static render(template: string, values: Object): string {
		let value_patt = /{{(\w+\.*)+}}/
		let rendered = template;

		let result;
		while((result = value_patt.exec(rendered)) !== null) {
			const placeholder = result[0].slice(2, result[0].length-2);

			rendered = rendered.replace(result[0], objFromStr(values, placeholder));
		}

		return rendered;
	}
}