var vows = require('vows')
  , precedence = require('./index')
  , assert = require('assert')

var suite = vows.describe('precedence-maps')
suite.addBatch(
{ 'Graphs':
  { topic: function() {
      precedence.setGraph("test", {
        map: {
          "test1" : { outgoing: ["test2"] },
          "test2" : { outgoing: ["test4"] },
          "test3" : { incoming: ["test1"], outgoing: ["test2"] },
          "test4" : { incoming: ["test1"] },
        }
      });
      return precedence.getOrder("test");
    }
  , 'should be sorted correctly': function(er, result) {
      assert.instanceOf(result, Array)
      assert.deepEqual(result, [ 'test1', 'test3', 'test2', 'test4' ]);
    }
  }
, 'cyclic graphs':
  { topic: function() {
      precedence.setGraph("test", {
        map: {
          "test1" : { outgoing: ["test2"] },
          "test2" : { outgoing: ["test4"] },
          "test3" : { incoming: ["test1"], outgoing: ["test2"] },
          "test4" : { outgoing: ["test1"] },
        }
      });
      return precedence.getOrder("test");
    }
  , 'should throw an exception': function(err, val) {
      assert.instanceOf(err, Error)
    }
  }


})
.run(null, function() {
  (suite.results.broken+suite.results.errored) > 0 && process.exit(1)
})
