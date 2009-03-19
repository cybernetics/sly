# Sly - The JavaScript Selector Engine

Cutting-edge JavaScript helper for parsing *CSS3 selectors* to find
and match DOM elements. A *framework independent* drop-in solution.

## Features

 * Fast and intelligent query algorithm for best performance
 * Optimizations for frequently used selectors
 * No dependencies on other libraries
 * Only **4kb** (minified and gzipped)
 * Extensible pseudo selectors and combinators
 * JS libraries can override internal methods like getAttribute
 * Generates a reusable JS representation from selectors
 * Selector representation is cached
 * Standalone CSS3 parser

## Why Another One?

I started with the first version of Sly as MooTools branch in February 2008 (still on [SVN](http://svn.mootools.net/branches/NewSelectorParser/).
In the end the branch was forgotten since Valerio did a great job to optimize MooTools selectors for the 1.2 release.
When discussions about fast and accurate selector engines came up again, I found back to my old code and checked it
against the new kids on the block.

It was and still is just an experiment, a plaything for an optimization addict like me. I hope it inspires other developers and
libraries.

## How Does It Work

Documentation will come, enojoy reading the code for now.