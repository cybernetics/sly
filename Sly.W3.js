/*! Sly v1.0rc0 <http://sly.digitarald.com> - (C) 2009 Harald Kirschner <http://digitarald.de> - Open source under MIT License */

Sly.implement('pseudos', {

	// All the exhilarating w3 ideas go here for the sake of completeness.
	// http://www.w3.org/TR/css3-selectors/#pseudo-classes

	// Useful extras go in Sly.Custom.js, vote them out of here if you find them useful ;)

	// missing: # :nth-of-type(), :nth-last-of-type(), :first-of-type, :last-of-type, :only-of-type pseudo-class

	// http://www.w3.org/TR/css3-selectors/#root-pseudo
	'root': function(node) {
		return (node.parentNode == node.ownerDocument);
	},

	// http://www.w3.org/TR/css3-selectors/#target-pseudo
	'target': function(node) {
		var hash = location.hash;
		return (node.id && hash && node.id == hash.slice(1));
	},

	// http://www.w3.org/TR/css3-selectors/#only-child-pseudo
	'only-child': function(node, value, state) {
		return (Sly.pseudos['first-child'](node, null, state) && Sly.pseudos['last-child'](node, null, state));
	}

});

// Always call recompile after using implement!
Sly.recompile();
