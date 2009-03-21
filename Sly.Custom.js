/**
 * Sly - The JavaScript Selector Engine
 *
 * Custom combinators, pseudos and operators
 *
 * @version: preview
 *
 * @author: Harald Kirschner <http://digitarald.de>
 * @copyright: Authors
 *
 * @license: MIT-style license.
 */


 Sly.implement('combinators', {

	// Custom combinators, from MooTools Slick.js

	'<': function(found, self, selector, state, uniques){
	  while ((self = self.parentNode) && self.nodeType !== 9) {
	    if (Sly.checkUid(self, uniques) && selector.match(self, state)) found.push(self);
	  }
	},

	'^': function(found, self, selector, state, uniques){
	  self = self.firstChild;
	  if (self){
	    if (node.nodeType === 1 && Sly.checkUid(self, uniques) && selector.match(self, state)) found.push(self);
	    else this['+'](found, self, selector, state, uniques);
	  }
	},

	'++': function(found, self, selector, state, uniques){
		while ((context = context.nextSibling)) {
			if (context.nodeType === 1 && Sly.checkUid(context, uniques) && selector.match(context, state)) found.push(context);
		}
		return found;
	},

	'--': function(found, self, selector, state, uniques){
		while ((context = context.previousSibling)) {
			if (context.nodeType === 1 && Sly.checkUid(context, uniques) && selector.match(context, state)) found.push(context);
		}
		return found;
	},

	'±': function(found, self, selector, state, uniques){
		return this['--'](this['++'](found, self, selector, state, uniques), self, selector, state, uniques);
	}

});



Sly.implement('pseudos', {

	// Custom pseudos, like jQuery filter

	// Matches all elements that are hidden.
	'hidden': function(item) {
		return !this.visible(item);
	},

	// Matches all elements that are visible.
	'visible': function(item) {
		return (element.offsetWidth && element.offsetHeight);
	},

	// Matches elements which contain at least one element that matches the specified selector.
	'has': function(item, argument) {
		return Sly.find(argument, item);
	},

	// Matches all elements that are disabled.
	'disabled': function(item) {
		return (item.disabled == true);
	},

	// Matches all elements that are enabled.
	'enabled': function(item) {
		return (item.disabled != false);
	},

	// Matches all elements that are enabled.
	'selected': function(item) {
		return (item.selected != false);
	}

	// be creative ;)


});

Sly.implement('operators', {

	'/=': function(value, escaped) {
		return value;
	}

});

Sly.recompile();
