# Sly - The JavaScript Selector Engine

Cutting-edge JavaScript helper for parsing *CSS3 selectors* to find
and match DOM elements. A *framework independent* drop-in solution.

## Features

 * Fast and intelligent query algorithm for *best performance*
 * *Optimisations* for frequently used selectors
 * No dependencies on other libraries
 * Less than **3 kb** ([shrinked](http://dean.edwards.name/packer/) and [gzipped](http://en.wikipedia.org/wiki/Gzip) or *5kb* [Base62 encoded](http://dean.edwards.name/packer/))
 * *Extensible* pseudo selectors, attribute operators and combinators
 * JS libraries can override internal methods, e.g. `getAttribute`
 * *Standalone* CSS3 parser generates a *reusable* JS representation from selectors
 * Representations and their computed methods are cached
 * Code follows the MooTools philosophy, respecting strict standards, throwing no warnings and using meaningful variable names

## Credits

The parse and compute algorithm is not based on other frameworks, but:

 * Collection of combinators and pseudo-classes is based on MooTools and the additional custom pseudo-classes on jQuery.
 * Thanks to [Steven Levithan](http://blog.stevenlevithan.com/), the master of regular expressions, for all the optimisation tips.

## The Tale About The "Why" 

I started with the first version of Sly as [MooTools](http://mootools.net) [branch](http://svn.mootools.net/branches/NewSelectorParser/) in February 2008.
Later on, the branch was forgotten, since Valerio did a great job to optimize selectors for the 1.2 release.
When discussions about fast and accurate selector engines came up again in the last months, I recovered and updated
my old obsession to check it against the new kids on the block.

It was and still is just an *exercise*, relaxation for an *optimisation addict* like me. I hope it inspires other developers and
libraries, incorporating the whole source or only pick some snippets.

## How Does It Work

Enjoy reading the code, this is a work in progress:

### Sly.parse

	var list = Sly.parse(sequence (*string*)[, compute *function*])

Splits a sequence of CSS selectors into their JS representation, an `Array` of `Objects`.

#### Flow

	var example = 'ul#my-list > li.selected a:nth-child("odd"), a[href^=#]';
	console.log(Sly.parse(example));
	
... returns an `Array` with 3 `Objects`, one for every selector in the
group. *For better readability, properties with empty Arrays (e.g. classes) false or null are left out*:

	[
		{
			tag: 'ul',
			id: 'my-list',
			first: true
		},
		{
			tag: 'li',
			classes: ['odd'],
			combinator: '>'
		},
		{
			tag: 'a',
			pseudos: [{
				name: 'nth-child',
				value: 'odd'
			}],
			combinator: ' ',
			last: true
		},
		{
			tag: 'a',
			attributes: [{
				name: 'href',
				operator: '=',
				value: '#'
			}],
			first: true,
			last: true
		}
	]

#### Specifications

 * The parser does not validate the sequence
 * The universal selector `*` is not saved to the tag property
 * Values for pseudo or attribute values *can* be wrapped in `""` or `''`, only required for complex values or better readability.
 * The second parameter `compute` is called on every `Object` (see `Sly.compute()`).

### Sly.search

	var nodes = Sly.search(sequence (*string*)[, context *node*]);

### Sly.find

	var node = Sly.find(sequence (*string*)[, context *node*]);

### Sly.match

	var bool = Sly.match(node (*node*), squence *string*);
