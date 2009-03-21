/**
 * Sly - The JavaScript Selector Engine
 *
 * Cutting-edge JavaScript helper for parsing CSS3 selectors to find
 * and match DOM elements. A framework independent drop-in solution.
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

var Sly = {

	/**
	 * Sly.feature
	 *
	 * @todo Test on quirks
	 */

	feature: {
		querySelector: !!(document.querySelectorAll),
		elementsByClass: !!(document.getElementsByClassName)
	},

	/**
	 * Sly.getAttribute()
	 *
	 * Override that with your favourite framework.
	 */

	getAttribute: function(item, name) {
		if (name == 'class') return item.className;
		return item.getAttribute(name, 2);
	},

	escapeRegExp: function(str) {
		return str.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
	},

	implement: function(key, properties) {
		for (var prop in properties) this[key][prop] = properties[prop];
	}

};

/**
 * Sly.parse(sequence, compute)
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

(function() {

// Old pattern: (/[\w\u00c0-\uFFFF-][\w\u00c0-\uFFFF-]*|[#.][\w\u00c0-\uFFFF-]+|[ \t\r\n\f](?=[\w\u00c0-\uFFFF*#.[:-])|([,+>~])[ \t\r\n\f]*|\[([\w\u00c0-\uFFFF-]+)(?:([!*^$~|\/]?=)(?:"([^"]*)"|'([^']*)'|([^\]]*)))?]|:([-\w\u00c0-\uFFFF]+)(?:\((?:"([^"]*)"|'([^']*)'|([^)]*))\))?|\*/g)
var pattern;

Sly.recompile = function() {

	// ,+>~
	var combinators = [','];
	for (var key in Sly.combinators) {
		if (key != ' ') {
			combinators[(key.length > 1) ? 'unshift' : 'push'](Sly.escapeRegExp(key));
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


var empty = function($0) {
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

Sly.parse = function(sequence, compute) {
	// normalise
	sequence = (typeof(sequence) == 'string') ? sequence.replace(/^\s+/, '') : '';
	compute = compute || empty;

	// check cache, is saved to the "compute" callback.
	var cache = compute.$cache || (compute.$cache = {});
	if (cache[sequence]) return cache[sequence];

	var parsed = [], current = create();
	var first = current.first = true;

	var refresh = function(combinator) {
		parsed.push(compute(current));
		current = create(combinator);
	};

	var match, $0;

	while ((match = pattern.exec(sequence))) {
		$0 = match[0];

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
				refresh(null, true);
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

	return (cache[sequence] = parsed);
};

})();

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


(function() {

var empty = function(value) {
	return true;
};

function matchId(item, id) {
	return (item.id == id);
};

function matchTag(item, tag) {
	return (item.nodeName == tag);
};

function prepareClass(name) {
	return (new RegExp('(?:^|[ \\t\\r\\n\\f])' + name + '(?:$|[ \\t\\r\\n\\f])'));
};

function matchClass(item, expr) {
	return item.className && expr.test(item.className);
};

function prepareAttribute(attr) {
	if (!attr.operator || !attr.value) return attr;
	var parser = Sly.operators[attr.operator];
	if (parser) {
		attr.pattern = new RegExp(parser(attr.value, attr.value.replace(Sly.escapeRegExp, '\\$&')));
	}
	return attr;
};

function matchAttribute(item, attr) {
	var read = Sly.getAttribute(item, attr.name);
	switch (attr.operator) {
		case null: return read;
		case '=': return (read == attr.value);
		case '!=': return (read != attr.value);
	}
	if (!read && !attr.value) return false;
	return attr.pattern.test(read); // @todo: Allow functions, not only regex
};

// chains two given functions

function chain(prepend, append, aux, unshift) {
	var fn = (prepend) ? ((unshift) ? function(item, state) {
		return append(item, aux, state) && prepend(item, state);
	} : function(item, state) {
		return prepend(item, state) && append(item, aux, state);
	}) : function(item, state) {
		return append(item, aux, state);
	};
	fn.$slyIndex = (prepend) ? (prepend.$slyIndex + 1) : 0;
	return fn;
};


Sly.compute = function(selector) {

	var i, item, match, search, matchSearch, tagged,
		tag = selector.tag,
		id = selector.id,
		classes = selector.classes;

	var nodeName = (tag) ? tag.toUpperCase() : null;

	if (id) {
		tagged = true;
		matchSearch = chain(matchSearch, matchId, id);

		search = function(context) {
			if (context.getElementById) {
				var el = context.getElementById(id);
				return (el && (!nodeName || el.nodeName == nodeName)) ? [el] : [];
			}

			var query = context.getElementsByTagName(tag || '*');
			for (var i = 0, item; (item = query[i]); i++) {
				if (item.id == id) return [item];
			}
			return [];
		};
	}

	if (classes.length > 0) {
		if (!search && Sly.feature.elementsByClass) {

			for (i = 0; (item = classes[i]); i++) {
				matchSearch = chain(matchSearch, matchClass, prepareClass(item));
			}

			var joined = classes.join(' ');
			search = function(context) {
				return context.getElementsByClassName(joined);
			};

		} else if (!search && classes.length == 1) { // optimized for typical .one-class-only

			tagged = true;
			var expr = prepareClass(classes[0]);
			matchSearch = chain(matchSearch, matchClass, expr);


			search = function(context) {
				var query = context.getElementsByTagName(tag || '*');
				var found = [];
				for (var i = 0, item; (item = query[i]); i++) {
					if (item.className && expr.test(item.className)) found.push(item);
				}
				return found;
			};
		} else {
			for (i = 0; (item = classes[i]); i++) {
				match = chain(match, matchClass, prepareClass(item));
			}
		}
	}

	if (tag) {
		if (!search) {
			matchSearch = chain(matchSearch, matchTag, nodeName);

			search = function(context) {
				return context.getElementsByTagName(tag);
			}
		} else if (!tagged) { // search does not filter by tag yet
			match = chain(match, matchTag, nodeName);
		}
	} else if (!search) { // default engine
		search = function(context) {
			return context.getElementsByTagName('*');
		}
	}

	for (i = 0; (item = selector.pseudos[i]); i++) {
		if (item.name == 'not') { // optimized :not(), so it is fast and useful
			var not = Sly.parse(item.value, Sly.compute)[0].match; // TODO: validate
			match = chain(match, function(item, state) {
				return !not(item, state);
			}, {});
		} else {
			var parser = Sly.pseudos[item.name];
			match = (parser) ? chain(match, parser, item.value) : chain(match, matchAttribute, prepareAttribute(item))
		}
	}

	for (i = 0; (item = selector.attributes[i]); i++) {
		match = chain(match, matchAttribute, prepareAttribute(item));
	}

	if ((selector.simple = !(match))) {
		selector.matchAux = empty;
	} else {
		selector.matchAux = match;
		matchSearch = chain(matchSearch, match);
	}

	selector.match = matchSearch || empty;

	selector.combine = Sly.combinators[selector.combinator || ' '];

	selector.search = search;

	return selector;
};

})();


(function() {

	var toArray = function(elements) {
		return Array.prototype.slice.call(elements);
	};

	try {
			toArray(document.documentElement.childNodes);
	} catch (e) {
		toArray = function(elements) {
			if (elements instanceof Array) return elements;
			var i = elements.length, results = new Array(i);
			while (i--) results[i] = elements[i];
			return results;
		};
	}

	Sly.toArray = toArray;

})();


/**
 * Sly.checkUid(element), Sly.checkUid(element, uniques)
 *
 * Uid helper, to identify and merge elements.
 */

(function() {

var next = 1;

var getUid = Sly.getUid = (window.ActiveXObject) ? function(item){
	return (item.$slyUid || (item.$slyUid = {id: next++})).id;
} : function(item){
	return item.$slyUid || (item.$slyUid = next++);
};

// not D.R.Y. but fast
Sly.checkUid = function(item, uniques){
	var uid = getUid(item);
	return (uniques[uid]) ? null : (uniques[uid] = true);
};

})();


/**
 * Sly.search(sequence, context)
 */

Sly.search = function(sequence, context) {
	context = context || document;

	var results = [];

	if (Sly.feature.querySelector && context.nodeType == 9) {

		/* @todo refactor
		if (context.nodeType != 9) {
			var reset = context.id;
			context.id = 'uid-' + Sly.getUid(context);
			var custom =  sequence.replace(/^|,/g, '$&' + '#' + context.id + ' ');
		}
		if (custom) context.id = reset;*/

		try {
			results = context.querySelectorAll(sequence);
		} catch(e) {}
		if (results) return Sly.toArray(results);
	}

	// @todo Error handling, parse is very loose
	var parsed = Sly.parse(sequence, Sly.compute);

	var elements,
		all = {}, // uniques for all results
		current = {}, // uniques for one iteration process
		state = {}, // matchers temporary state
		combined; // elements from one iteration process

	// unifiers
	var getUid = Sly.getUid;
	var locateCurrent = function(item){
		var uid = getUid(item);
		return (current[uid]) ? null : (current[uid] = true);
	};

	var locateFast = function() {
		return true;
	};

	for (var i = 0, selector; (selector = parsed[i]); i++) {

		var locate = locateCurrent;

		if (selector.first) {
			if (!results.length) locate = locateFast;
			if (selector.combinator) elements = [context]; // allows combinators before selectors
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
			for (var k = 0, l = elements.length; k < l; k++) combined = selector.combine(combined, elements[k], state, locate);
		}
		if (selector.last) results = combined;
		else elements = combined;
	}

	return results;
};


/**
 * Sly.find(item, selector)
 */

Sly.find = function(sequence, context) {
	return Sly.search(sequence, context)[0];
}

/**
 * Sly.match(item, selector)
 */

Sly.match = function(item, sequence) {
	return (!sequence) || Sly.parse(sequence, Sly.compute)[0].match(item, {});
};


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

// @todo Find a better solution for unique checks. (chain on matchAux/

Sly.combinators = {

	' ': function(combined, context, state, locate, fast) {
		var items = this.search(context);
		if (fast && this.simple) return Sly.toArray(items);
		for (var i = 0, item; (item = items[i]); i++) {
			if (locate(item) && this.matchAux(item, state)) combined.push(item);
		}
		return combined;
	},

	'>': function(combined, context, state, locate) {
		var items = this.search(context);
		for (var i = 0, item; (item = items[i]); i++) {
			if (item.parentNode == context && locate(item) && this.matchAux(item, state)) combined.push(item);
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
 * Sly.parseNth() - Helper
 */

(function() {

var cache = {};

Sly.parseNth = function(argument) {
	if (cache[argument]) return cache[argument];
	var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
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
	return (cache[argument] = parsed);
};

})();

/**
 * Sly.pseudos - Basic set
 */

Sly.pseudos = {

	// w3c pseudo classes

	'first-child': function(item) {
		return Sly.pseudos.index(item, 0);
	},

	'last-child': function(item) {
		while ((item = item.nextSibling)) {
			if (item.nodeType === 1) return false;
		}
		return true;
	},

	'only-child': function(item) {
		var prev = item;
		while ((prev = prev.previousSibling)) {
			if (prev.nodeType === 1) return false;
		}
		var next = item;
		while ((next = next.nextSibling)) {
			if (next.nodeType === 1) return false;
		}
		return true;
	},

	'nth-child': function(item, argument, state) {
		var parsed = Sly.parseNth(argument || 'n');
		if (parsed.special != 'n') return Sly.pseudos[parsed.special](item, parsed.a, state);
		state.positions = state.positions || {};
		var uid = Sly.getUid(item) ;
		if (!state.positions[uid]) {
			var count = 0;
			while ((item = item.previousSibling)) {
				if (item.nodeType != 1) continue;
				count++;
				var position = state.positions[Sly.getUid(item)];
				if (position != undefined) {
					count = position + count;
					break;
				}
			}
			state.positions[uid] = count;
		}
		return (state.positions[uid] % parsed.a == parsed.b);
	},

	'empty': function(item) {
		return !(item.innerText || item.textContent || '').length;
	},

	'contains': function(item, text) {
		return (item.innerText || item.textContent || '').indexOf(text) != -1;
	},

	'index': function(item, index) {
		var count = 0;
		while ((item = item.previousSibling)) {
			if (item.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	'even': function(item, argument, state) {
		return Sly.pseudos['nth-child'](item, '2n', state);
	},

	'odd': function(item, argument, state) {
		return Sly.pseudos['nth-child'](item, '2n+1', state);
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