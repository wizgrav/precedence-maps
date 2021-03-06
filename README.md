# Precedence maps

Graphing and ordered maps for scheduling execution of tasks, fast.

[![Build Status](https://travis-ci.org/wizgrav/precedence-maps.png)](https://travis-ci.org/wizgrav/precedence-maps)

## Installation

`npm install precedence-maps`

then in your code:

```js
precedence = require('precedence-maps')
```

## Usage
First we need to define a graph for our application.

```js
var graphDefinitions = {
  "man": { incoming: ["god"], outgoing: ["animal"]},
  "god": { outgoing: ["animal","man"]}, // outgoing means things that come after
  "animal": { incoming: ["god","man"]}  // and incoming for things that come before
}
precedence.setGraph("mygraph", {
  map: graphDefinitions
});
precedence.getOrder("mygraph"); // [ 'god', 'man', 'animal' ]
```

The order will be flagged for refresh whenever setGraph is called for the specific graph. You can make several changes in the graph definitions, setGraph with/or without options(setting options refresh the configuration), and calculation will only take place when getOrder() is called or internally in the stores as needed.

```js
var store = precedence.newStore("mygraph", Array) // Create a store where keys match properties in graphDefinitions
store('man').push("mike") // We declared Array to be the default constructor so that's what we get on new symbols.
store('god').push("loki");
store('man').push("bill");
store('animal').push("rat");
store('animal').push("pig");
store('man').push("kate");
store('god').push("thor");
// Calling store with no arguments returns an array orders by the graph
store().forEach(function (v) { console.log(v); });
/*
[ 'loki', 'thor' ]
[ 'mike', 'bill', 'kate' ]
[ 'rat', 'pig' ]
*/
```

Parsing the graph definitions can also be customized by providing/overriding two methods. Enumerate(graph) which must return an unordered array of graph symbols and collect(graph, symbolName) which will run per symbol and must return either an object like

```js
{ 
  incoming: ["symbolNameBefore1","symbolNameBefore2",...],
  outgoing: ["symbolNameAfter1",...]
}
```

or a false value to omit this symbol from sorting.
## API

### precedence.setGraph(name, options)

+ name {String} Unique name to refer to this graph.
+ config {Object} Configurations for this graph.


### precedence.getOrder(name)

+ name {String} name of the graph we want to get the order from

Returns: {Array} a list of names, sorted in the order of precedence

### precedence.newStore(name, template)

+ name {String} name of the graph we want to order the map with.
+ template {Function} Optional, a constructor to create instances of when a new key is accessed.

## Tests

Run the tests with `node test.js`.

## Legal

MIT License