/**
 * Sly - The JavaScript Selector Engine
 *
 * Cutting-edge JavaScript helper for parsing CSS3 selectors to find
 * and match DOM nodes. A framework independent drop-in solution.
 *
 * Credits: Combinator and pseudo sets are based on MooTools <http://mootools.net.
 * Original code base was created for MooTools 1.2
 *
 * @version: preview
 *
 * @author: Harald Kirschner <http://digitarald.de>
 * @copyright: Authors
 *
 * @license: MIT-style license.
 */

var Sly = (function() {

var cache = {};
var trim = /^\s+/;

var Sly = function(text) {
	text = (typeof(text) == 'string') ? text.replace(trim, '') : '';
	return cache[text] || (cache[text] = new Sly.initialize(text));
}

Sly.initialize = function(text) {
	this.text = text;
};

Sly.initialize.prototype = Sly.prototype;

Sly.prototype.search = function(context) {
	context = context || document;

	var results = [];

	if (Sly.features.querySelector && context.nodeType == 9) {

		/* @todo refactor
		if (context.nodeType != 9) {
			var reset = context.id;
			context.id = 'uid-' + Sly.getUid(context);
			var custom =  text.replace(/^|,/g, '$&' + '#' + context.id + ' ');
		}
		if (custom) context.id = reset;*/

		try {
			results = context.querySelectorAll(text);
			return Sly.toArray(results);
		} catch(e) {}
	}

	var parsed = this.parse();

	var nodes,
		all = {}, // unique ids for all results
		current = {}, // unique ids for one iteration process
		state = {}, // matchers temporary state
		combined; // nodes from one iteration process

	// unifiers
	var getUid = Sly.getUid;
	var locateCurrent = function(node){
		var uid = getUid(node);
		return (current[uid]) ? null : (current[uid] = true);
	};

	var locateFast = function() {
		return true;
	};

	for (var i = 0, selector; (selector = parsed[i]); i++) {

		var locate = locateCurrent;

		if (selector.first) {
			if (!results.length) locate = locateFast;
			if (selector.combinator) nodes = [context]; // allows combinators before selectors
		}

		if (selector.last && results.length) {
			current = all;
			combined = results;
		} else { // default stack
			current = {};
			combined = [];
		}

		if (!selector.combinator) {
			// without prepended combinator
			combined = selector.combine(combined, context, state, locate, !(combined.length));
		} else {
			// with prepended combinators
			for (var k = 0, l = nodes.length; k < l; k++) combined = selector.combine(combined, nodes[k], state, locate);
		}
		if (selector.last) results = combined;
		else nodes = combined;
	}

	return results;
};


/**
 * Sly.find
 */
Sly.prototype.find = function(context) {
	return this.search(context)[0];
};


/**
 * Sly.match
 */
Sly.prototype.match = function(node) {
	return !!(this.parse()[0].match(node, {}));
};


/**
 * Sly.filter
 */
Sly.prototype.filter = function(nodes) {
	var results = [], match = this.parse()[0].match;
	for (var i = 0, node; (node = nodes[i]); i++) {
		if (match[node]) results.push(node);
	}
	return results;
};


/**
 * Sly.parse(text, compute)
 *
 * Returns an array with one object for every selector:
 *
 * {
 *   tag: (String) Tagname (defaults to null for universal *)
 *   id: (String) Id
 *   classes: (Array) Classnames
 *   attributes: (Array) Attribute objects with "name", "operator" and "value"
 *   pseudos: (Array) Pseudo objects with "name" and "value"
 *   operator: (Char) The prepended operator (not comma)
 *   first: (Boolean) true if it is the first selector or the first after a comma
 *   ident: (Array) All parsed matches, can be used as cache identifier.
 * }
 *
 * The compute function is called as iterator when a selector is finished.
 */

var pattern;

Sly.recompile = function() {

	// ,+>~
	var combinators = [','];
	for (var key in Sly.combinators) {
		if (key != ' ') {
			combinators[(key.length > 1) ? 'unshift' : 'push'](escapeRegExp(key));
		}
	}

	// !*^$~|\\/
	var operators = ['!'];
	for (var key in Sly.operators) operators.push(key);

	/**
	  The regexp is a group of every possible selector part including combinators.
	  "|" separates the possible selectors.

		Capturing parentheses (several groups don't need them):
		1 - Combinator (only needed to match multiple-char combinators)
		2 - Attribute name
		3 - Attribute operator
		4, 5, 6 - The value
		7 - Pseudo name
		8, 9, 10 - The value
	 */

	pattern = new RegExp(
		// A tagname, "*" is not matched because it is not a tagname that we would need
		'[\\w\\u00c0-\\uFFFF][\\w\\u00c0-\\uFFFF-]*|' +
		// An id or the classname
		'[#.][\\w\\u00c0-\\uFFFF-]+|' +
		// Whitespace (descendant combinator)
		'[ \\t\\r\\n\\f](?=[\\w\\u00c0-\\uFFFF*#.[:])|' +
		// Other combinators and the comma
		'(' + combinators.join('|') + ')[ \\t\\r\\n\\f]*|' +
		// An attribute, with the various and optional value formats ([name], [name=value], [name="value"], [name='value']
		'\\[([\\w\\u00c0-\\uFFFF-]+)(?:([' + operators.join('') + ']?=)(?:"([^"]*)"|\'([^\']*)\'|([^\\]]*)))?]|' +
		// A pseudo-class, with various formats
		':([-\\w\\u00c0-\\uFFFF]+)(?:\\((?:"([^"]*)"|\'([^\']*)\'|([^)]*))\\))?|' +
		// The universial selector, usually ignored
		'\\*', 'g'
	);
};

var plain = function($0) {
	return $0;
};

// I prefer it outside, not sure if this is faster
var create = function(combinator) {
	return {
		ident: [],
		classes: [],
		attributes: [],
		pseudos: [],
		combinator: combinator
	};
};

Sly.prototype.parse = function() {
	if (this.parsed) return this.parsed;

	var text = this.text;
	var compute = this.compute;

	var parsed = [], current = create();
	current.first = true;

	var refresh = function(combinator) {
		parsed.push(compute(current));
		current = create(combinator);
	};

	var match;

	while ((match = pattern.exec(text))) {
		var $0 = match[0];

		switch ($0.charAt(0)) {
			case '.':
				current.classes.push($0.slice(1));
				break;
			case '#':
				current.id = $0.slice(1);
				break;
			case '[':
				current.attributes.push({
					name: match[2],
					operator: match[3] || null,
					value: match[4] || match[5] || match[6] || null
				});
				break;
			case ':':
				current.pseudos.push({
					name: match[7],
					value: match[8] || match[9] || match[10] || null
				});
				break;
			case ',':
				current.last = true;
				refresh(null);
				current.first = true;
				continue;
			case ' ': case '\t': case '\r': case '\n': case '\f':
				match[1] = ' ';
			default:
				var combinator = match[1];
				if (combinator) {
					if (current.first && !current.ident.length) current.combinator = combinator;
					else refresh(combinator);
				} else {
					if ($0 != '*') current.tag = $0;
				}
		}
		current.ident.push($0);
	}

	current.last = true;
	parsed.push(compute(current));

	return (this.parsed = parsed);
};


/**
 * Sly.compute(selector)
 *
 * Attaches the following methods to the selector object:
 *
 * {
 *   search: Uses the most convinient properties (id, tag and/or class) of the selector as search.
 *   matchAux: If search does not contain all selector properties, this method matches an element against the rest.
 *   match: Matches an element against all properties.
 *   simple: Set when matchAux is not needed.
 * }
 */

// chains two given functions

function chain(prepend, append, aux, unshift) {
	var fn = (prepend) ? ((unshift) ? function(node, state) {
		return append(node, aux, state) && prepend(node, state);
	} : function(node, state) {
		return prepend(node, state) && append(node, aux, state);
	}) : function(node, state) {
		return append(node, aux, state);
	};
	fn.$slyIndex = (prepend) ? (prepend.$slyIndex + 1) : 0;
	return fn;
};

var comperators = {

	empty: function() {
		return true;
	},

	matchId: function(node, id) {
		return (node.id == id);
	},

	matchTag: function(node, tag) {
		return (node.nodeName == tag);
	},

	prepareClass: function(name) {
		return (new RegExp('(?:^|[ \\t\\r\\n\\f])' + name + '(?:$|[ \\t\\r\\n\\f])'));
	},

	matchClass: function(node, expr) {
		return node.className && expr.test(node.className);
	},

	prepareAttribute: function(attr) {
		if (!attr.operator || !attr.value) return attr;
		var parser = Sly.operators[attr.operator];
		if (parser) {
			attr.pattern = new RegExp(parser(attr.value, attr.value.replace(escapeRegExp, '\\$&')));
		}
		return attr;
	},

	matchAttribute: function(node, attr) {
		var read = Sly.getAttribute(node, attr.name);
		switch (attr.operator) {
			case null: return read;
			case '=': return (read == attr.value);
			case '!=': return (read != attr.value);
		}
		if (!read && !attr.value) return false;
		return attr.pattern.test(read); // @todo: Allow functions, not only regex
	}

};

Sly.prototype.compute = function(selector) {

	var i, item, match, search, matchSearch, tagged,
		tag = selector.tag,
		id = selector.id,
		classes = selector.classes;

	var nodeName = (tag) ? tag.toUpperCase() : null;

	if (id) {
		tagged = true;

		matchSearch = chain(matchSearch, comperators.matchId, id);

		search = function(context) {
			if (context.getElementById) {
				var el = context.getElementById(id);
				return (el && (!nodeName || el.nodeName == nodeName)) ? [el] : [];
			}

			var query = context.getElementsByTagName(tag || '*');
			for (var j = 0, node; (node = query[j]); j++) {
				if (node.id == id) return [node];
			}
			return [];
		};
	}

	if (classes.length > 0) {
		if (!search && Sly.features.elementsByClass) {

			for (i = 0; (item = classes[i]); i++) {
				matchSearch = chain(matchSearch, comperators.matchClass, comperators.prepareClass(item));
			}

			var joined = classes.join(' ');
			search = function(context) {
				return context.getElementsByClassName(joined);
			};

		} else if (!search && classes.length == 1) { // optimized for typical .one-class-only

			tagged = true;

			var expr = comperators.prepareClass(classes[0]);
			matchSearch = chain(matchSearch, comperators.matchClass, expr);

			search = function(context) {
				var query = context.getElementsByTagName(tag || '*');
				var found = [];
				for (var i = 0, node; (node = query[i]); i++) {
					if (node.className && expr.test(node.className)) found.push(node);
				}
				return found;
			};

		} else {

			for (i = 0; (item = classes[i]); i++) {
				match = chain(match, comperators.matchClass, comperators.prepareClass(item));
			}

		}
	}

	if (tag) {

		if (!search) {
			matchSearch = chain(matchSearch, comperators.matchTag, nodeName);

			search = function(context) {
				return context.getElementsByTagName(tag);
			};
		} else if (!tagged) { // search does not filter by tag yet
			match = chain(match, comperators.matchTag, nodeName);
		}

	} else if (!search) { // default engine

		search = function(context) {
			return context.getElementsByTagName('*');
		};

	}

	for (i = 0; (item = selector.pseudos[i]); i++) {

		if (item.name == 'not') { // optimized :not(), so it is fast and useful
			var not = Sly(item.value); // TODO: validate
			match = chain(match, function(node, state) {
				return !not.match(node);
			}, {});
		} else {
			var parser = Sly.pseudos[item.name];
			match = (parser) ? chain(match, parser, item.value) : chain(match, comperators.matchAttribute, comperators.prepareAttribute(item))
		}

	}

	for (i = 0; (item = selector.attributes[i]); i++) {
		match = chain(match, comperators.matchAttribute, comperators.prepareAttribute(item));
	}

	if ((selector.simple = !(match))) {
		selector.matchAux = comperators.empty;
	} else {
		selector.matchAux = match;
		matchSearch = chain(matchSearch, match);
	}

	selector.match = matchSearch || comperators.empty;

	selector.combine = Sly.combinators[selector.combinator || ' '];

	selector.search = search;

	return selector;
};


// public, overridable

Sly.features = {
	querySelector: !!(document.querySelectorAll),
	elementsByClass: !!(document.getElementsByClassName)
};

Sly.getAttribute = function(node, name) {
	if (name == 'class') return node.className;
	return node.getAttribute(name, 2);
};

var toArray = function(nodes) {
	return Array.prototype.slice.call(nodes);
};

try {
	toArray(document.documentElement.childNodes);
} catch (e) {
	toArray = function(nodes) {
		if (nodes instanceof Array) return nodes;
		var i = nodes.length, results = new Array(i);
		while (i--)
			results[i] = nodes[i];
		return results;
	};
}

Sly.toArray = toArray;

Sly.implement = function(key, properties) {
	for (var prop in properties) this[key][prop] = properties[prop];
};

var nextUid = 1;

Sly.getUid = (window.ActiveXObject) ? function(node){
	return (node.$slyUid || (node.$slyUid = {id: nextUid++})).id;
} : function(node){
	return node.$slyUid || (node.$slyUid = nextUid++);
};

// private

var escapeRegExp = function(text) {
	return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
};

// generic methods

Sly.generise = function(name) {
	Sly[name] = function(text) {
		var cls = Sly(text);
		return cls[name].apply(cls, Array.prototype.slice.call(arguments, 1));
	}
};

var generics = ['parse', 'search', 'find', 'match', 'filter'];
for (var i = 0; generics[i]; i++) Sly.generise(generics[i]);

return Sly;

})();


Sly.operators = {

	'*=': function(value, escaped) {
		return escaped;
	},

	'^=': function(value, escaped) {
		return '^' + escaped;
	},

	'$=': function(value, escaped) {
		return value + '$';
	},

	'~=': function(value, escaped) {
		return '(?:^|[ \\t\\r\\n\\f])' + escaped + '(?:$|[ \\t\\r\\n\\f])';
	},

	'|=': function(value, escaped) {
		return '(?:^|\\|)' + escaped + '(?:$|\\|)';
	}

};


/**
 * Sly.combinators - Basic set
 */
Sly.combinators = {

	' ': function(combined, context, state, locate, fast) {
		var nodes = this.search(context);
		if (fast && this.simple) return Sly.toArray(nodes);
		for (var i = 0, node; (node = nodes[i]); i++) {
			if (locate(node) && this.matchAux(node, state)) combined.push(node);
		}
		return combined;
	},

	'>': function(combined, context, state, locate) {
		var nodes = this.search(context);
		for (var i = 0, node; (node = nodes[i]); i++) {
			if (node.parentNode == context && locate(node) && this.matchAux(node, state)) combined.push(node);
		}
		return combined;
	},

	'+': function(combined, context, state, locate) {
		while ((context = context.nextSibling)) {
			if (context.nodeType == 1) {
				if (locate(context) && this.match(context, state)) combined.push(context);
				break;
			}

		}
		return combined;
	},

	'~': function(combined, context, state, locate) {
		while ((context = context.nextSibling)) {
			if (context.nodeType == 1) {
				if (!locate(context)) break;
				if (this.match(context, state)) combined.push(context);
			}
		}
		return combined;
	}

};


/**
 * Sly.parseNth()
 */
(function() {

var cache = {};

Sly.parseNth = function(value) {
	if (cache[value]) return cache[value];
	var parsed = value.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
	if (!parsed) return false;
	var inta = parseInt(parsed[1]);
	var a = ($chk(inta)) ? inta : 1;
	var special = parsed[2] || false;
	var b = parseInt(parsed[3]) || 0;
	b--;
	while (b < 1) b += a;
	while (b >= a) b -= a;
	switch (special) {
		case 'n': parsed = {a: a, b: b, special: 'n'}; break;
		case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
		case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
		case 'first': parsed = {a: 0, special: 'index'}; break;
		case 'last': parsed = {special: 'last-child'}; break;
		case 'only': parsed = {special: 'only-child'}; break;
		default: parsed = {a: (a - 1), special: 'index'};
	}
	return (cache[value] = parsed);
};

})();


/**
 * Sly.pseudos - Basic set
 */
Sly.pseudos = {

	// w3c pseudo classes

	'first-child': function(node) {
		return Sly.pseudos.index(node, 0);
	},

	'last-child': function(node) {
		while ((node = node.nextSibling)) {
			if (node.nodeType === 1) return false;
		}
		return true;
	},

	'only-child': function(node) {
		var prev = node;
		while ((prev = prev.previousSibling)) {
			if (prev.nodeType === 1) return false;
		}
		var next = node;
		while ((next = next.nextSibling)) {
			if (next.nodeType === 1) return false;
		}
		return true;
	},

	'nth-child': function(node, value, state) {
		var parsed = Sly.parseNth(value || 'n');
		if (parsed.special != 'n') return Sly.pseudos[parsed.special](node, parsed.a, state);
		state.positions = state.positions || {};
		var uid = Sly.getUid(node) ;
		if (!state.positions[uid]) {
			var count = 0;
			while ((node = node.previousSibling)) {
				if (node.nodeType != 1) continue;
				count++;
				var position = state.positions[Sly.getUid(node)];
				if (position != undefined) {
					count = position + count;
					break;
				}
			}
			state.positions[uid] = count;
		}
		return (state.positions[uid] % parsed.a == parsed.b);
	},

	'empty': function(node) {
		return !(node.innerText || node.textContent || '').length;
	},

	'contains': function(node, text) {
		return (node.innerText || node.textContent || '').indexOf(text) != -1;
	},

	'index': function(node, index) {
		var count = 0;
		while ((node = node.previousSibling)) {
			if (node.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	'even': function(node, value, state) {
		return Sly.pseudos['nth-child'](node, '2n', state);
	},

	'odd': function(node, value, state) {
		return Sly.pseudos['nth-child'](node, '2n+1', state);
	}

};

Sly.recompile();

// public methods
/*
if (window.MooTools && window.Native) {

	Native.implement([Document, Element], {

		getElements: function(selectors, nocash) {
			new Elements(Sly.search(selectors, this), {ddup: false, cash: !nocash});
		}

	});

	Element.implement({

		match: function(selector) {
			return Sly.match(this, selector);
		}

	});
}
*/