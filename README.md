# Sly - The JavaScript Selector Engine

> **Sly** is a JavaScript class for querying DOM documents using *[CSS3 selectors](http://www.w3.org/TR/css3-selectors/)*, that is agile, *cross-browser* and *library agnostic*.


## Features

 * Powerful and pure *JavaScript* match algorithm for *fast* and *accurate* queries
 * Extra optimisations for *frequently used selectors* and *latest browser features*
 * Works uniformly in `DOM` documents, fragments and `XML` documents
 * Assisting methods for matching and filtering of elements
 * *Stand-alone selector parser* to produce *JavaScript* `Object` representations
 * *Customisable* pseudo-classes, attribute operators and combinators
 * **3 kB** ([minified](http://developer.yahoo.com/yui/compressor/) and [gzipped](http://www.gzip.org/), **8 kB** without *gzip*)
 * No dependencies on JS libraries, but developers can override internal methods (e.g. `getAttribute`) for seamless integration
 * Code follows the [MooTools](http://mootools.net) philosophy, respecting strict standards, throwing no warnings and using meaningful variable names


## Usage

**Sly** is all about selectors and matching them against elements.

### Basic Syntax

> *`engine`*  =  **`Sly`**`(selector);`
>
> *`result`*  =  `engine.`*`method`*`(...);`

**Arguments**: `selector` (*required*) is a CCS selector.

**Returns**: The **Sly** instance, holding all the methods for querying and matching elements (*instances are cached*).

Shorter notation:

> *`result`*  =  **`Sly`**`(selector).`*`method`*`(...);`

### Sly generics

Every method is also accessible in a different notation:

> *`result`*  =  **`Sly`**`.`*`method`*`(selector, ...);`

Examples:

	found = Sly.search(selector, parent)
	// is the same as
	found = Sly(selector).search(parent);
	
	bool = new Sly(selector).match(someElement);
	// is the same as
	bool = Sly.match(match, someElement);

### Querying with *search* and *find*

> *`elements`*  =  **`Sly`**`(selector).search([parent]);`

**Arguments**: parent (*optional*) the document or an element.

**Returns**: The method  a *JavaScript* `Array` of elements. It will be empty if there was no match.

Examples:

	// Finds all div blocks
	blocks = Sly.search('div');
	
	// Finds all anchors with `href` attribute that starts with `"http://"`
	anchors = Sly.search('a[href^="http://"]');
	
	// Finds all list item that are direct descendants of the list item with id `"navigation"`
	items = Sly.search('ul#navigation > li');
	
	// Finds all heading elements
	heads = Sly.search('h1, h2, h3, h4, h5, h6');
	
	// Finds all odd rows in all tables with the class `"zebra"`
	rows = Sly.search('table.zebra tr:odd');
	
	// Finds something and looks really complex
	inputs = Sly.search('form[action$=/send/] label~span+input[type=text]:first-child');

You can also query for a *single* element:

> *`element`*  =  **`Sly`**`.find(selector[, parent]);`

**Returns**: The first matched element or `null`.

#### Descendants

Descendants can be at the beginning of a selector, using the optional `parent` element as reference.

	parent = Sly.find('#content')
	
	// Finds every second descendant children of parent
	children = Sly.search('> :odd', parent);
	
	// Finds the next slibing of parent, if its an anchor
	anchors = Sly.find('+ a');
	
	// Finds all slibings from parent that are `div` blocks
	blocks = Sly.find('~div');
	
	// Finds all descendant children, of all descendant children, of all descendant children, of all descendant children of parent
	items = Sly.find('>>>>');


#### Customisation
	
[Sly.Custom](master/Sly.Custom.js) provides more extensions for

 * Combinators like `<` (*parent element*), `^` (*previous slibing*) or `<^±^>` (*The-Combinator-Smilie*)
 * Attribute operators like `[title/="^Item \\d+$"]` (*regular expression match*)
 * Pseudo-classes like `:hidden` and `:enabled`

### Matching with *match* and *find*

> *`bool`*  =  **`Sly`**`(selector).match(element);`

**Argument**: element (*required*) to check against.

**Returns**: `true` if the `element` matches the `selector` properties, otherwise `false`.

> *`bool`*  =  **`Sly`**`(selector).filter(elements);`

**Argument**: element (*required*) to check against.

**Returns**: A new `Array` of elements, containing all the elements that matched the `selector` properties.

### Parsing with *parse*

> *`list`*  =  **`Sly`**`(selector).parse([plain]);`

**Arguments**: If `plain` (*optional*) is `true`, the parser will not call `Sly.compute` to add additional search and match
methods to the representation.

**Returns**: Splits a sequence of CSS selectors into their *JavaScript* representation, an `Array` of `Objects` for every selector.
This is only done once, afterwards the created Array is reused in `search`, `match`, etc.

Parsed example:

	example = 'ul#my-list > li.selected a:nth-child("odd"), a[href^=#]';
	parsed = Sly.parse(example);

Returns an `Array` with 4 `Objects`, one for every selector in the 2 groups:

	// Properties with empty `Arrays` (e.g. `classes`) `false` or `null` are left out in this scheme
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


#### Some Specifications

 * The parser does not validate the sequence
 * The universal selector `"*"` is not saved to the `tag` property
 * Values for pseudo-classes or attributes *can* be wrapped in `""` or `''`, only required for *complex* values or better readability


## The Tale About The "Why" 

I started with the first version of **Sly** as [*MooTools*](http://mootools.net) [branch](http://svn.mootools.net/branches/NewSelectorParser/) in February 2008.
Later on, the branch was forgotten, since [*Valerio*](http://mad4milk.net) did a great job to optimise selectors for the `1.2` release.
When discussions about fast and accurate selector engines came up again in the last months, I recovered and updated
my old obsession to check it against the new kids on the block. The results were surprising, so I added documentation and specs
to release it to the public.

**Sly** was, and still is, just an *exercise*, relaxation for an *optimisation addict* like me. 
I hope it inspires other developers to incorporate it completely or take apart the source so that it is used within their libraries or work.


## Credits

It was once branched from [*MooTools*](http://mootools.net) (somewhere between 1.11 and 1.2) so it follows its architecture and uses overlapping helpers.

 * Thanks to [*Steven Levithan*](http://blog.stevenlevithan.com/), the master of regular expressions, for all the optimisation tips
 * Additional custom pseudo-classes on *jQuery*


## Licence

See [LICENSE](master/LICENSE).
