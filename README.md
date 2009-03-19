# Sly - The JavaScript Selector Engine

Cutting-edge JavaScript helper for parsing *CSS3 selectors* to find
and match DOM elements. A *framework independent* drop-in solution.

## Features

 * Fast and intelligent query algorithm for *best performance*
 * *Optimizations* for frequently used selectors
 * No dependencies on other libraries
 * Only **4kb** (minified and gzipped)
 * *Extensible* pseudo selectors and combinators
 * JS libraries can override internal methods like getAttribute
 * Generates a *reusable* JS representation from selectors
 * Selector representation is cached
 * *Standalone* CSS3 parser

## Credits

 * Combinator and pseudo selector collection is based on MooTools.
 * Thanks to [Steven Levithan](http://blog.stevenlevithan.com/), the master of regular expressions, for all the optimization tips.

## The Tale About The "Why" 

I started with the first version of Sly as [MooTools](http://mootools.net) [branch](http://svn.mootools.net/branches/NewSelectorParser/) in February 2008.
Later on, the branch was forgotten, since Valerio did a great job to optimize selectors for the 1.2 release.
When discussions about fast and accurate selector engines came up again in the last months, I recovered and updated
my old obsession to check it against the new kids on the block.

It was and still is just an *exercise*, relaxation for an *optimization addict* like me. I hope it inspires other developers and
libraries, using the whole helper or only pick some snippets.

## How Does It Work

Enjoy reading the code, more documentation will come.