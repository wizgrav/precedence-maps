// Utilities to define graphs and calculate order of doing things, fast.

var toposort = require('toposort');

module.exports = {
  newStore: newStore,
  setGraph: setGraph,
  getOrder: getOrder
};

var graphs = {};
var orders = {};

/**
 * An ordered store implemented as a closure. 
 * Keys access instances of the template type.
 * The default template is the Array constructor.
 * If called without argument returns an ordered list.
 * The elements of that list are the template instances.
 * @params {name} src - The graph name.
 */
function newStore (graphName, template) {
  var obj = {
    template: template,
    precedence: null, // Last known order of precedence. Dirty flag.
    mapped: {}, // key = component name, value = array of its behaviors.
    lists: [] // A list of behavior lists, ordered by the execution graph.
  };
  
  return function (key, value) {
    var type = typeof key;
    var graph = graphs[graphName];

    var isFunc =  type === "function";
    if (key === undefined || isFunc ) {
      var order = getOrder(graphName);

      if (isFunc || (order && order !== obj.precedence)) {
        var lists = [];
        obj.precedence = order;

        order.forEach(function (listName) {
          var list = obj.mapped[listName];
          
          if (list !== undefined) {
            lists.push(list);
            if (isFunc) key.call(graph, listName, list);
          }
        });
        obj.lists = lists;
      }
      return obj.lists;
    } else if(type === "string"){
      var list = obj.mapped[key];
      if (!list || value !== undefined){
        if (!list) delete obj.precedence;
        list = obj.mapped[key] = value ? value : (obj.template ? new obj.template() : undefined);
      }
      return list;
    }
  }
}

/**
 * Sorts a named graph and returns an array of component names in order of precedence.
 *
 * @params {name} src - The graph name.
 */
function sortGraph (name) {
  var graph = graphs[name];
  if (!graph || !graph.map) return; // map can be components, systems etc
  var connections = [];
  var nodes = [];

  function process (graph, name, edges, direction) {
    if (!edges) return;

    edges.forEach(function (connection) {
      connections.push(!direction ? [connection, name] : [name, connection]);
    });
  }

  graph.enumerate(graph).forEach(function (key) {
    var item = graph.collect(graph, key);
    if (!item) return;
    
    nodes.push(item.name ? item.name: key);

    var incoming = item['incoming'];
    if (Array.isArray(incoming)) process(graph, key, incoming);
    
    var outgoing = item['outgoing'];
    if (Array.isArray(outgoing)) process(graph, key, outgoing, true);
  });
  if (connections.length) orders[name] = toposort.array(nodes, connections);
  return orders[name] ? orders[name] : nodes;
}

/**
 * Retuns an array of string names in the order of precedence for a named graph.
 *
 * @params {name} name - The graph name.
 */
function getOrder (name) {
  if (!name) return;
  var graph = graphs[name];
  if (!graph) return;
  return orders[name] ? orders[name] : sortGraph(name);
}

/**
 * Set or update the configuration for a named graph.
 * Using this will invalidate the order for this graph
 * so the next call to .getOrder() gets to regenerate it.
 *
 * @params {name} name - The graph name.
 * @params {name} options - The graph configuration.
 */

function setGraph (name, options) {
  if (!(name && options)) return;
  var graph = graphs[name];
  if (!graph) graph = graphs[name] = {};
  if (options) {
    Object.keys(options).forEach(function (key) {
      graph[key] = options[key];
    });
    if(!graph.enumerate) graph.enumerate = function (graph) { return Object.keys(graph.map); };
    if(!graph.collect) graph.collect = function (graph, name) { return graph.map[name]; };
  }
  delete orders[name];
}
