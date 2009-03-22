/**
 * Sly.js Specs
 *
 * @license: MIT-style license.
 */

var parsed;

describe('Sly.parse', {

	'Should return an Array': function() {
		value_of(Sly.parse('')).should_have(1, 'length');
		value_of(Sly.parse('*')).should_have(1, 'length');
		value_of(Sly.parse('ul li')).should_have(2, 'length');
		value_of(Sly.parse('* * *')).should_have(3, 'length');
		value_of(Sly.parse(':contains(" ")')).should_have(1, 'length');
	},

	'Should return an Array for invalid sequences': function() {
		value_of(Sly.parse(2)).should_have_exactly(1, 'items');
		value_of(Sly.parse(null)).should_have_exactly(1, 'items');
	},

	'Should parse tags': function() {
		value_of(Sly.parse('div')[0].tag).should_be('div');
		value_of(Sly.parse('[attr=""]div:pseudo')[0].tag).should_be('div');
		value_of(Sly.parse('div a')[1].tag).should_be('a');
		value_of(Sly.parse('> div')[0].tag).should_be('div');
		value_of(Sly.parse('xml-node')[0].tag).should_be('xml-node');
		value_of(Sly.parse('xml_node')[0].tag).should_be('xml_node');
		value_of(Sly.parse('1st-node')[0].tag).should_be('1st-node');
	},

	'Should parse ids': function() {
		value_of(Sly.parse('#id')[0].id).should_be('id');
		value_of(Sly.parse('#1st-id_0')[0].id).should_be('1st-id_0'); // actually an invalid id
		value_of(Sly.parse('#id-head')[0].id).should_be('id-head');
		value_of(Sly.parse(':pseudo[attribute]#id')[0].id).should_be('id');
	},

	'Should parse classes': function() {
		value_of(Sly.parse('.classX')[0].classes).should_be(['classX']);
		value_of(Sly.parse('.classX.classY')[0].classes).should_be(['classX', 'classY']);
		value_of(Sly.parse('[attr].classX:pseudo.classY')[0].classes).should_be(['classX', 'classY']);
		value_of(Sly.parse('.1st-class_0')[0].classes).should_be(['1st-class_0']);
	},

	'Should parse attributes': function() {
		value_of(Sly.parse('[attr]')[0].attributes).should_be([{name: 'attr', operator: null, value: null}]);
		value_of(Sly.parse('[attr][attr]')[0].attributes).should_be([{name: 'attr', operator: null, value: null}, {name: 'attr', operator: null, value: null}]);
		value_of(Sly.parse('[attr]tag:pseudo[attr]')[0].attributes).should_be([{name: 'attr', operator: null, value: null}, {name: 'attr', operator: null, value: null}]);
		value_of(Sly.parse('[1st-attr_0]')[0].attributes).should_be([{name: '1st-attr_0', operator: null, value: null}]);
	},

	'Should parse attributes with empy value': function() {
		value_of(Sly.parse('[attr=]')[0].attributes).should_be([{name: 'attr', operator: '=', value: null}]);
		value_of(Sly.parse('[attr=""]')[0].attributes).should_be([{name: 'attr', operator: '=', value: null}]);
		value_of(Sly.parse("[attr='']")[0].attributes).should_be([{name: 'attr', operator: '=', value: null}]);
	},

	'Should parse attributes with values': function() {
		value_of(Sly.parse('[attr=value]')[0].attributes).should_be([{name: 'attr', operator: '=', value: 'value'}]);
		value_of(Sly.parse('[attr="value"]')[0].attributes).should_be([{name: 'attr', operator: '=', value: 'value'}]);
		value_of(Sly.parse("[attr='value']")[0].attributes).should_be([{name: 'attr', operator: '=', value: 'value'}]);

		value_of(Sly.parse('[attr=v"alu\'e]')[0].attributes).should_be([{name: 'attr', operator: '=', value: 'v"alu\'e'}]);
		value_of(Sly.parse('[attr="value[\']"]')[0].attributes).should_be([{name: 'attr', operator: '=', value: 'value[\']'}]);
		value_of(Sly.parse("[attr='value[\"]']")[0].attributes).should_be([{name: 'attr', operator: '=', value: 'value["]'}]);
	},

	'Should parse pseudos': function() {
		value_of(Sly.parse(':pseudo')[0].pseudos).should_be([{name: 'pseudo', value: null}]);
		value_of(Sly.parse(':pseudo#id:pseudo')[0].pseudos).should_be([{name: 'pseudo', value: null}, {name: 'pseudo', value: null}]);
		value_of(Sly.parse(':1st-pseudo_0')[0].pseudos).should_be([{name: '1st-pseudo_0', value: null}]);
	},

	'Should parse pseudos with empy value': function() {
		value_of(Sly.parse(':pseudo()')[0].pseudos).should_be([{name: 'pseudo', value: null}]);
		value_of(Sly.parse(':pseudo("")')[0].pseudos).should_be([{name: 'pseudo', value: null}]);
		value_of(Sly.parse(":pseudo('')")[0].pseudos).should_be([{name: 'pseudo', value: null}]);
	},

	'Should parse pseudos with values': function() {
		value_of(Sly.parse(':pseudo(value)')[0].pseudos).should_be([{name: 'pseudo', value: 'value'}]);
		value_of(Sly.parse(':pseudo("value")')[0].pseudos).should_be([{name: 'pseudo', value: 'value'}]);
		value_of(Sly.parse(":pseudo('value')")[0].pseudos).should_be([{name: 'pseudo', value: 'value'}]);

		value_of(Sly.parse(':pseudo(v"alu\'e)')[0].pseudos).should_be([{name: 'pseudo', value: 'v"alu\'e'}]);
		value_of(Sly.parse(':pseudo("value(\')")')[0].pseudos).should_be([{name: 'pseudo', value: 'value(\')'}]);
		value_of(Sly.parse(":pseudo('value(\")')")[0].pseudos).should_be([{name: 'pseudo', value: 'value(")'}]);
	},

	'Should parse special characters': function() {
		value_of(Sly.parse('sñörebröd')[0].tag).should_be('sñörebröd');
		value_of(Sly.parse('.sñörebröd')[0].classes[0]).should_be('sñörebröd');
		value_of(Sly.parse('#sñörebröd')[0].id).should_be('sñörebröd');
		value_of(Sly.parse('[sñörebröd]')[0].attributes[0].name).should_be('sñörebröd');
		value_of(Sly.parse(':sñörebröd')[0].pseudos[0].name).should_be('sñörebröd');
	},

	'Should not parse * to tag': function() {
		value_of(Sly.parse('')[0].tag).should_be_undefined();
		value_of(Sly.parse('*')[0].tag).should_be_undefined();
		parsed = Sly.parse('* *');
		value_of(parsed[0].tag).should_be_undefined();
		value_of(parsed[1].tag).should_be_undefined();
		parsed = Sly.parse('* * *');
		value_of(parsed[0].tag).should_be_undefined();
		value_of(parsed[1].tag).should_be_undefined();
		value_of(parsed[2].tag).should_be_undefined();
	},

	'Should parse combinators': function() {
		value_of(Sly.parse('* *')[1].combinator).should_be(' ');
		value_of(Sly.parse('a > a')[1].combinator).should_be('>');
		value_of(Sly.parse('a>a')[1].combinator).should_be('>');
		value_of(Sly.parse('a >a')[1].combinator).should_be('>');
		value_of(Sly.parse('a>  a')[1].combinator).should_be('>');
		value_of(Sly.parse('a>')[1].combinator).should_be('>');
		value_of(Sly.parse('> a')[0].combinator).should_be('>');
		value_of(Sly.parse('~ a')[0].combinator).should_be('~');
		value_of(Sly.parse('+ a')[0].combinator).should_be('+');
	},

	'Should parse whitespace characters as combinators': function() {
		value_of(Sly.parse('a\ta')[1].combinator).should_be(' ');
		value_of(Sly.parse('a\na')[1].combinator).should_be(' ');
		value_of(Sly.parse('a\ra')[1].combinator).should_be(' ');
		value_of(Sly.parse('a\fa')[1].combinator).should_be(' ');
	},

	'Should mark the first selector': function() {
		parsed = Sly.parse('a b, > c, d');
		value_of(parsed[0].first).should_be_true();
		value_of(parsed[1].first).should_be_undefined();
		value_of(parsed[2].first).should_be_true();
		value_of(parsed[3].first).should_be_true();
	},

	'Should mark the last selector': function() {
		parsed = Sly.parse('a b, > c, d');
		value_of(parsed[0].last).should_be_undefined();
		value_of(parsed[1].last).should_be_true();
		value_of(parsed[2].last).should_be_true();
		value_of(parsed[3].last).should_be_true();
	}

});

var computed;

describe('Sly.compute', {

	'Should return an Array': function() {
		computed = Sly.parse('a');
		value_of(computed).should_have(1, 'length');
	},

	'Should add search, match and matchAux methods': function() {
		computed = Sly.parse('a');
		value_of(computed[0]).should_include('search');
		value_of(computed[0]).should_include('match');
		value_of(computed[0]).should_include('matchAux');
	},

	'Should set simple false when matchAux is needed': function() {
		computed = Sly.parse('[attr], :pseudo, tag:pseudo');
		value_of(computed[0].simple).should_be_false();
		value_of(computed[1].simple).should_be_false();
		value_of(computed[2].simple).should_be_false();
	},

	'Should set simple true when matchAux is not needed': function() {
		computed = Sly.parse('a, .classX, #id, tag#id');
		value_of(computed[0].simple).should_be_true();
		value_of(computed[1].simple).should_be_true();
		value_of(computed[2].simple).should_be_true();
		value_of(computed[3].simple).should_be_true();
	}

});

var element;

describe('Sly.match', {

	'Should return true for a matched element': function() {
		element = document.createElement('div');
		element.className = 'classX';
		element.id = 'idX';

		value_of(Sly.match('*', element)).should_be_true();
		value_of(Sly.match('div', element)).should_be_true();
		value_of(Sly.match('div.classX', element)).should_be_true();
		value_of(Sly.match('.classX', element)).should_be_true();
		value_of(Sly.match('#idX', element)).should_be_true();
		value_of(Sly.match('#idX.classX', element)).should_be_true();
	},

	'Should return false for an unmatched element': function() {
		value_of(Sly.match('#idY', element)).should_be_false();
		value_of(Sly.match('a', element)).should_be_false();
		value_of(Sly.match('.classY', element)).should_be_false();
	},

	'Should return true for missing selector': function() {
		value_of(Sly.match(null, element)).should_be_true();
	},

	'Should match by pseudo': function() {
	},

	'Should match by attribute': function() {
	},

	'Should ignore combinators': function() {
		value_of(Sly.match('> div', element)).should_be_true();
		value_of(Sly.match('~ div', element)).should_be_true();
		value_of(Sly.match(' div', element)).should_be_true();
	}

});

var tree = document.createElement('div');
tree.innerHTML = [
	'<dl id="list"><dt id="dt-1">Term</dt><dd id="dd-1"><dl><dt>Subdesc</dt><dd>Subterm</dd></dl></dd><dt id="dt-2">Term</dt><dd id="dd-2">Desc</dd></dl>',
	'<a href="#top" title="Title" class="classX classY"><span><span>Internal</span></span></a>',
	'<a href="http://digitarald.de" rel="me">Home</a>'
].join('\n');

describe('Sly.search Fragment', {

	'Should return elements': function() {
		value_of(Sly.search('*', tree)).should_have(12, 'items');
		value_of(Sly.search('#list', tree)).should_have(1, 'items');
		value_of(Sly.search('[href]', tree)).should_have(2, 'items');
		value_of(Sly.search('[href][title]', tree)).should_have(1, 'items');
		value_of(Sly.search('#list > dt', tree)).should_have(2, 'items');
	},

	'Should return an empty Array': function() {
		value_of(Sly.search('dl span', tree)).should_have(0, 'items');
		value_of(Sly.search('dl > span', tree)).should_have(0, 'items');
		value_of(Sly.search('[href] dl', tree)).should_have(0, 'items');
		value_of(Sly.search('span + a', tree)).should_have(0, 'items');
		value_of(Sly.search('span #list', tree)).should_have(0, 'items');
		value_of(Sly.search('a span .classX', tree)).should_have(0, 'items');
	},

	'Should return elements with prepended combinator': function() {
		value_of(Sly.search('>', tree)).should_have(3, 'items');
		value_of(Sly.search('> span', tree)).should_have(0, 'items');
		value_of(Sly.search(' > span', tree)).should_have(0, 'items');
		value_of(Sly.search('* > span', tree)).should_have(2, 'items');
		value_of(Sly.search('+ a')).should_have(0, 'items');
	}

});


describe('Sly.find', {

	'Should return one element': function() {
	}

});

describe('Custom - Sly.parse', {

	'Should parse combinator <': function() {
		value_of(Sly.parse('a < b')[1].combinator).should_be('<');
		value_of(Sly.parse('< b')[0].combinator).should_be('<');
		value_of(Sly.parse('b <')[1].combinator).should_be('<');
	},

	'Should parse combinator ^': function() {
		value_of(Sly.parse('a ^ b')[1].combinator).should_be('^');
		value_of(Sly.parse('^ b')[0].combinator).should_be('^');
		value_of(Sly.parse('b ^')[1].combinator).should_be('^');
	},

	'Should parse combinator ++': function() {
		value_of(Sly.parse('a ++ b')[1].combinator).should_be('++');
		value_of(Sly.parse('++ b')[0].combinator).should_be('++');
		value_of(Sly.parse('b ++')[1].combinator).should_be('++');
	},

	'Should parse combinator --': function() {
		value_of(Sly.parse('a -- b')[1].combinator).should_be('--');
		value_of(Sly.parse('-- b')[0].combinator).should_be('--');
		value_of(Sly.parse('b --')[1].combinator).should_be('--');
	},

	'Should parse combinator ±': function() {
		value_of(Sly.parse('a ± b')[1].combinator).should_be('±');
		value_of(Sly.parse('± b')[0].combinator).should_be('±');
		value_of(Sly.parse('b ±')[1].combinator).should_be('±');
	},

	'Should parse The-Combinator-Smilie': function() {
		parsed = Sly.parse('<^±^>');
		value_of(parsed[0].combinator).should_be('<');
		value_of(parsed[1].combinator).should_be('^');
		value_of(parsed[2].combinator).should_be('±');
		value_of(parsed[3].combinator).should_be('^');
		value_of(parsed[4].combinator).should_be('>');
	}

});