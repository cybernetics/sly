/*
Script: Sly.js
	CSS3 querying capabilities for targeting elements.

License:
	MIT-style license.
*/

var Sly = {

	// available features

	Features: {
		querySelector: !!(document.querySelectorAll),
		elementsByClass: !!(document.getElementsByClassName)
	},

	search: function(selectors, context) {
		context = context || document;

		var results;

		if (Sly.Features.querySelector) {
			if (!context.ownerDocument) {
				var oldId = context.id;
				context.id = 'uid-' + Sly.getUId(context);
				var custom = '#' + context.id + ' ' + selectors;
			}
			try {
				results = Array.prototype.slice.call(context.querySelectorAll(custom || selectors));
			} catch(e) {}
			if (custom) context.id = oldId;
			if (results) return results;
		}

		var elements = [context], merged = {}, buffer = {};

		var check = Sly.checkUId;
		
		var merge = function() {
			if (results) {
				if (elements.length) {
					for (var i = 0, item; (item = elements[i]); i++) {
						if (check(item, merged)) results.push(item);
					}
				}
				return results;
			}

			return Array.prototype.slice.call(elements);
		};

		var parsed = Sly.parse(selectors, Sly.compute);

		for (var i = 0, selector; (selector = parsed[i]); i++) {
			
			if (i > 0 && selector.first) results = merge(); // must be one after a comma
				
			if (!selector.combinator) { // first without prepended combinator
				elements = Sly.Combinators[' ']([], context, selector, buffer);
				/*
				elements = selector.search(root);
				if (!selector.simple) {
					var found = [];
					for (var m = 0, n = elements.length; m < n; m++) {
						var item = elements[m];
						if (selector.matchAux(item, buffer)) found.push(item);
					}
					elements = found;
				}
				*/
			} else { // with prepended combinators
				var found = [], uniques = {}, combinator = Sly.Combinators[selector.combinator];
				for (var k = 0, l = elements.length; k < l; k++) found = combinator(found, elements[k], selector, buffer, uniques);
				elements = found;
			}
		}

		return merge();
	},

	match: function(item, selector) {
		return (!selector) || Sly.parse(selector, Sly.compute)[0].match(item, {});
	},

	// utilities

	getAttribute: function(item, name) {
		if (name == 'class') return item.className;
		return item.getAttribute(name, 2);
	}

};

(function() {

var stack = 1;

Sly.getUId = (window.ActiveXObject) ? function(item){
	return uid = (item.$slyUid || (item.$slyUid = {id: stack++})).id;
} : function(item){
	return uid = item.$slyUid || (item.$slyUid = stack++);
};

// not D.R.Y. but fast
Sly.checkUId = (window.ActiveXObject) ? function(item, uniques){
	var uid = (item.$slyUid || (item.$slyUid = {id: stack++})).id;
	return (uniques[uid]) ? null : (uniques[uid] = true);
} : function(item, uniques){
	var uid = item.$slyUid || (item.$slyUid = stack++);
	return (uniques[uid]) ? null : (uniques[uid] = true);
};

})();


// the magic parser

(function() {

var parser = (/[\w\u00c0-\uFFFF-][\w\u00c0-\uFFFF-]*|[#.][\w\u00c0-\uFFFF-]+|\s(?=[[\w\u00c0-\uFFFF*#.-])|([,+>~])\s*|\[([\w\u00c0-\uFFFF-]+)(?:([!*^$~|]?=)(?:"([^"]*)"|'([^']*)'|([^\]]*)))?]|:([-\w\u00c0-\uFFFF]+)(?:\((?:"([^"]*)"|'([^']*)'|([^)]*))\))?/g);

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

var lambda = function($0) {
	return $0;
};

var Selector = function(combinator) {
	return {
		// ident: (combinator) ? [combinator] : [],
		classes: [],
		attributes: [],
		pseudos: [],
		combinator: combinator
	};
};

Sly.parse = function(sequence, compute) {
	compute = compute || lambda;
	
	var cache = compute.$cache || (compute.$cache = {});
	if (cache[sequence]) return cache[sequence];

	var parsed = [], current = new Selector();
	current.first = true;
	
	var refresh = function(combinator) {
		if (current) {
			parsed.push(compute(current));
		}
		current = new Selector(combinator);
	};

	var match, $0;

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
				break;
			case ' ': case '+': case '>': case '~':
				refresh(match[1] || ' ');
				break;
			default:
				current.tag = $0;
		}
		// current.ident.push($0);
	}
	parsed.push(compute(current));

	return (cache[sequence] = parsed);
};

})();

(function() {
	
var pure = function() {
	return true;
};

var handlers = {

	matchId: function(item, id) {
		return (item.id === id);
	},

	matchTag: function(item, tag) {
		return (item.nodeName == tag);
	},

	matchClass: function(item, expr) {
		var cls = item.className;
		return cls && (' ' + cls + ' ').indexOf(expr) > -1;
	},

	matchAttribute: function(item, attr) {
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
	}

}

// chains two given functions

var chain = function(prepend, append, aux, unshift) {
	var fn = (prepend) ? ((unshift) ? function(item, buffer) {
		return append(item, aux, buffer) && prepend(item, buffer);
	} : function(item, buffer) {
		return prepend(item, buffer) && append(item, aux, buffer);
	}) : function(item, buffer) {
		return append(item, aux, buffer);
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
		matchSearch = chain(null, handlers.matchId, id);

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
		matchSearch = chain(null, handlers.matchTag, nodeName);
			
		search = function(context) {
			return context.getElementsByTagName(tag);
		}
	}
	
	var classes = selector.classes;

	if (classes.length > 0) {
		if (!search && Sly.Features.elementsByClass) {
			
			for (i = 0; (item = classes[i]); i++) {
				matchSearch = chain(matchSearch, handlers.matchClass, ' ' + item + ' ');
			}
			
			var joined = classes.join(' ');
			search = function(context) {
				return context.getElementsByClassName(joined);
			};
			
		} else if (!search && i == 1) {
			
			var cls = ' ' + classes[1] + ' ';
			matchSearch = chain(matchSearch, handlers.matchClass, cls);
			var rgx = new RegExp('(?:^|\s)' + classes[1] + '(?:$|\s)');
			
			search = function(context) {
				var query = context.getElementsByTagName('*');
				var found = [], el;
				for (var i = 0, item; (item = query[i]); i++) {
					if (item.className && rgx.test(item.className)) found.push(item);
				}
				return found;
			};
		} else {
			for (i = 0; (item = classes[i]); i++) {
				match = chain(match, handlers.matchClass, ' ' + item + ' ');
			}
		}
	}

	for (i = 0; (item = selector.pseudos[i]); i++) {
		var parser = Sly.Pseudos[item.name];
		if (parser) {
			match = chain(match, parser, item.argument);
		} else {
			match = chain(match, handlers.matchAttribute, item);
		}
	}

	for (i = 0; (item = selector.attributes[i]); i++) {
		match = chain(match, handlers.matchAttribute, item);
	}
	
	if ((selector.simple = !(match))) {
		selector.matchAux = pure;
	} else {
		selector.matchAux = match;
		matchSearch = chain(matchSearch, match);
	}
	
	selector.match = matchSearch || pure;
	
	selector.search = search || function(context) {
		return context.getElementsByTagName(tag || '*');
	};

	return selector;
};
	
})();


// combinators

Sly.Combinators = {

	' ': function(found, self, selector, buffer, uniques) {
		var items = selector.search(self), check = Sly.checkUId;
		if (!uniques && selector.simple) return items;
		for (var i = 0, item; (item = items[i]); i++) {
			if ((!uniques || check(item, uniques)) && selector.matchAux(item, buffer)) found.push(item);
		}
		return found;
	},

	'>': function(found, self, selector, buffer, uniques) {
		var items = selector.search(self), check = Sly.checkUId;
		for (var i = 0, item; (item = items[i]); i++) {
			if (item.parentNode == self && (!uniques || check(item, uniques)) && selector.matchAux(item, buffer)) found.push(item);
		}
		return found;
	},

	'+': function(found, self, selector, buffer, uniques) {
		var check = Sly.checkUId;
		while ((self = self.nextSibling)) {
			if (self.nodeType != 1) continue;
			if ((!uniques || check(item, uniques)) && selector.match(self, buffer)) found.push(self);
			break;
		}
		return found;
	},

	'~': function(found, self, selector, buffer, uniques) {
		var check = Sly.checkUId;
		while ((self = self.nextSibling)) {
			if (self.nodeType != 1) continue;
			if (uniques && !check(self, uniques)) break;
			if (selector.match(self, buffer)) found.push(self);
		}
		return found;
	}

};


// nth parser

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

Sly.Pseudos = {

	// w3c pseudo classes

	'first-child': function(item) {
		return Sly.Pseudos.index(item, 0);
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

	'nth-child': function(item, argument, buffer) {
		var parsed = Sly.parseNth(argument || 'n');
		if (parsed.special != 'n') return Sly.Pseudos[parsed.special](item, parsed.a, buffer);
		buffer.positions = buffer.positions || {};
		var uid = Sly.getUId(item) ;
		if (!buffer.positions[uid]) {
			var count = 0;
			while ((item = item.previousSibling)) {
				if (item.nodeType != 1) continue;
				count++;
				var position = buffer.positions[Sly.getUId(item)];
				if (position != undefined) {
					count = position + count;
					break;
				}
			}
			buffer.positions[uid] = count;
		}
		return (buffer.positions[uid] % parsed.a == parsed.b);
	},

	empty: function(item) {
		return !(item.innerText || item.textContent || '').length;
	},

	not: function(item, selector) {
		return !Sly.match(item, selector);
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

	even: function(item, argument, buffer) {
		return Sly.Pseudos['nth-child'](item, '2n', buffer);
	},

	odd: function(item, argument, buffer) {
		return Sly.Pseudos['nth-child'](item, '2n+1', buffer);
	}

};



// public methods

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