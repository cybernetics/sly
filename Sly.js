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
		querySelector: false && !!(document.querySelectorAll),
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

var parser = (/[\w\u00c0-\uFFFF-][\w\u00c0-\uFFFF-]*|[#.][\w\u00c0-\uFFFF-]+|[ \t\r\n\f](?=[[\w\u00c0-\uFFFF*#.-])|([,+>~])[ \t\r\n\f]*|\[([\w\u00c0-\uFFFF-]+)(?:([!*^$~|]?=)(?:"([^"]*)"|'([^']*)'|([^\]]*)))?]|:([-\w\u00c0-\uFFFF]+)(?:\((?:"([^"]*)"|'([^']*)'|([^)]*))\))?/g);

/**
	The regexp is a group of every possible selector part including combinators.
	"|" separates the possible selectors.

	\w\w*|  #  A tagname, "*" is not matched because it is not a tagname that we would need
	[#.][-\w]+|  #  A id or the classname
	\s(?=[[\w*#.])|  #  Whitespace (Descendant combinator)
	[+>~,]\s*|  #  Other combinators and the comma
	\[(\w+)(?:([!*^$~|]?)=(?:
		"([^"]*)"|
		'([^']*)'|
		([^\]]*))
	)?]|  #  A attribute, with the various and optional value formats ([name], [name=value], [name="value"], [name='value']
	:([-\w]+)(?:\((?:
		"([^"]*)"|
		'([^']*)'|
		([^)]*))\)
	)?  #  A pseudo-class, with various formats

	Capturing parentheses (several groups don't need them):
	1 - attribute name
	2 - attribute operator
	3, 4, 5 - one of them is the value
	6 - pseudo name
	7, 8, 9 - one of them is the value
 */

var empty = function($0) {
	return $0;
};

var Selector = function(combinator) {
	return {
		ident: [],
		classes: [],
		attributes: [],
		pseudos: [],
		combinator: combinator
	};
};

Sly.parse = function(sequence, compute) {
	compute = compute || empty;

	var cache = compute.$cache || (compute.$cache = {});
	if (cache[sequence]) return cache[sequence];

	var parsed = [], current = new Selector();
	var first = current.first = true;

	var refresh = function(combinator) {
		if (current) {
			parsed.push(compute(current));
		}
		current = new Selector(combinator);
	};

	var match, $0, step;

	while ((match = parser.exec(sequence))) {
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
					operator: match[3],
					value: match[4] || match[5] || match[6]
				});
				break;
			case ':':
				current.pseudos.push({
					name: match[7],
					argument: match[8] || match[9] || match[10]
				});
				break;
			case ',':
				refresh();
				current.first = true;
				continue;
			case ' ': case '+': case '>': case '~':
				var combinator = match[1] || ' ';
				if (current.first && !current.ident.length) current.combinator = combinator;
				else refresh(combinator);
				break;
			default:
				current.tag = $0;
		}
		current.ident.push($0);
	}
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

var lambda = function(value) {
	return function() {
		return value;
	};
};

function matchId(item, id) {
	return (item.id === id);
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

function matchAttribute(item, attr) {
	var read = Sly.getAttribute(item, attr.name);
	var operator = attr.operator;
	if (!read) return (operator == '!=');
	if (operator == null) return true;
	var value = attr.value;
	switch (operator){
		case '=': return (read == value);
		case '*=': return (read.indexOf(value) != -1);
		case '^=': return (read.substr(0, value.length) == value);
		case '$=': return (read.substr(read.length - value.length) == value);
		case '!=': return (read != value);
		case '~=': return ((' ' + read + ' ').indexOf(' ' + value + ' ') > -1);
		case '|=': return (('|' + read + '|').indexOf('|' + value + '|') > -1);
	}
	return true;
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
	var match, search, matchSearch;
	var i, item;

	var tag = selector.tag, id = selector.id;

	var nodeName = (tag) ? tag.toUpperCase() : null;

	if (id) {
		matchSearch = chain(null, matchId, id);

		search = function(item) {
			if (item.getElementById) {
				var el = item.getElementById(id);
				return (el && (!tag || el.nodeName == nodeName)) ? [el] : [];
			}

			var query = item.getElementsByTagName(tag || '*');
			for (var i = 0, item; (item = query[i]); i++) {
				if (item.id == id) return [item];
			}
			return [];
		};
	} else if (tag) {
		matchSearch = chain(null, matchTag, nodeName);

		search = function(context) {
			return context.getElementsByTagName(tag);
		}
	}

	var classes = selector.classes;

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

	for (i = 0; (item = selector.pseudos[i]); i++) {
		if (item.name == 'not') { // optimized :not(), so it is fast and useful
			var not = Sly.parse(item.argument, Sly.compute)[0].match; // TODO: validate
			match = chain(match, function(item, state) {
				return !not(item, state);
			}, {});
		} else {
			var parser = Sly.pseudo[item.name];
			match = (parser) ? chain(match, parser, item.argument) : chain(match, matchAttribute, item)
		}
	}

	for (i = 0; (item = selector.attributes[i]); i++) {
		match = chain(match, matchAttribute, item);
	}

	if ((selector.simple = !(match))) {
		selector.matchAux = lambda(true);
	} else {
		selector.matchAux = match;
		matchSearch = chain(matchSearch, match);
	}

	selector.match = matchSearch || lambda(true);

	selector.search = search || function(context) {
		return context.getElementsByTagName(tag || '*');
	};

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
	return uid = (item.$slyUid || (item.$slyUid = {id: next++})).id;
} : function(item){
	return uid = item.$slyUid || (item.$slyUid = next++);
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

	var results;

	if (Sly.feature.querySelector) {
		if (!context.ownerDocument) {
			var oldId = context.id;
			context.id = 'uid-' + Sly.getUid(context);
			var custom = '#' + context.id + ' ' + sequence;
		}
		try {
			results = Sly.toArray.call(context.querySelectorAll(custom || sequence));
		} catch(e) {}
		if (custom) context.id = oldId;
		if (results) return results;
	}

	var elements, merged = {}, state = {}, done = false;

	var check = Sly.checkUid;

	var merge = function() {
		if (!results) {
			return Sly.toArray(elements);
		} else if (elements.length) {
			for (var i = 0, item; (item = elements[i]); i++) {
				if (check(item, merged)) results.push(item);
			}
		}
		return results;
	};

	var parsed = Sly.parse(sequence, Sly.compute);

	for (var i = 0, selector; (selector = parsed[i]); i++) {
		var combinator = selector.combinator;

		if (selector.first) { // must be one after a comma
			if (i > 0) results = merge();
			if (combinator) elements = [context]; // allows combinators before selectors
		}

		if (!combinator) { // without prepended combinator
			elements = Sly.combinator[' ']([], context, selector, state);
		} else { // with prepended combinators
			var found = [], uniques = {}, concat = Sly.combinator[selector.combinator || ' '];
			for (var k = 0, l = elements.length; k < l; k++) found = concat(found, elements[k], selector, state, uniques);
			elements = found;
		}
	}

	return merge();
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



/**
 * Sly.combinator - Basic set
 */

Sly.combinator = {

	' ': function(found, context, selector, state, uniques) {
		var items = selector.search(context);
		if (!uniques && selector.simple) return items;
		for (var i = 0, item, check = Sly.checkUid; (item = items[i]); i++) {
			if ((!uniques || check(item, uniques)) && selector.matchAux(item, state)) found.push(item);
		}
		return found;
	},

	'>': function(found, context, selector, state, uniques) {
		var items = selector.search(context);
		for (var i = 0, item, check = Sly.checkUid; (item = items[i]); i++) {
			if (item.parentNode == context && (!uniques || check(item, uniques)) && selector.matchAux(item, state)) found.push(item);
		}
		return found;
	},

	'+': function(found, context, selector, state, uniques) {
		var check = Sly.checkUid;
		while ((context = context.nextSibling)) {
			if (context.nodeType != 1) continue;
			if ((!uniques || check(context, uniques)) && selector.match(context, state)) found.push(context);
			break;
		}
		return found;
	},

	'~': function(found, self, selector, state, uniques) {
		var check = Sly.checkUid;
		while ((self = self.nextSibling)) {
			if (self.nodeType != 1) continue;
			if (uniques && !check(self, uniques)) break;
			if (selector.match(self, state)) found.push(self);
		}
		return found;
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
 * Sly.pseudo - Basic set
 */

Sly.pseudo = {

	// w3c pseudo classes

	'first-child': function(item) {
		return Sly.pseudo.index(item, 0);
	},

	'last-child': function(item) {
		while ((item = item.nextSibling)) {
			if (item.nodeType == 1) return false;
		}
		return true;
	},

	'only-child': function(item) {
		var prev = item;
		while ((prev = prev.previousSibling)) {
			if (prev.nodeType == 1) return false;
		}
		var next = item;
		while ((next = next.nextSibling)) {
			if (next.nodeType == 1) return false;
		}
		return true;
	},

	'nth-child': function(item, argument, state) {
		var parsed = Sly.parseNth(argument || 'n');
		if (parsed.special != 'n') return Sly.pseudo[parsed.special](item, parsed.a, state);
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

	empty: function(item) {
		return !(item.innerText || item.textContent || '').length;
	},

	contains: function(item, text) {
		return (item.innerText || item.textContent || '').indexOf(text) != -1;
	},

	// custom pseudo selectors

	index: function(item, index) {
		var count = 0;
		while ((item = item.previousSibling)) {
			if (item.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	even: function(item, argument, state) {
		return Sly.pseudo['nth-child'](item, '2n', state);
	},

	odd: function(item, argument, state) {
		return Sly.pseudo['nth-child'](item, '2n+1', state);
	}

};



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