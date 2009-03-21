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

	'<': function(combined, context, state, locate){
	  while ((context = context.parentNode) && context.nodeType !== 9) {
	    if (locate(context) && this.match(context, state)) combined.push(context);
	  }
	},

	'^': function(combined, context, state, locate){
	  context = context.firstChild;
	  if (context){
	    if (node.nodeType === 1 && locate(context) && this.match(context, state)) combined.push(context);
	    else Sly.combinators['+'].call(this, combined, context, state);
	  }
	},

	'++': function(combined, context, state, locate){
		while ((context = context.nextSibling)) {
			if (context.nodeType === 1 && locate(context) && this.match(context, state)) combined.push(context);
		}
		return combined;
	},

	'--': function(combined, context, state, locate){
		while ((context = context.previousSibling)) {
			if (context.nodeType === 1 && locate(context) && this.match(context, state)) combined.push(context);
		}
		return combined;
	},

	'±': function(combined, context, state, locate){
		return Sly.combinators['--'].call(Sly.combinators['++'].call(combined, context, state, uniques), context, state, uniques);
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
