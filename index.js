
/**
 * Module dependencies.
 */

var moment = require('moment');
var conf = require('./config');
var ES = require('./client');
var dom = require('dom');
var k = require('k')(window);

// log template

var html = require('./log.html');
var min = require('minstache');
var render = min.compile(html);

// client

var es = new ES({
  url: conf.url
});

// query

dom('[name=query]').on('input', function(){
  var str = this.value.trim();
  clear();
  refresh(str);
});

/**
 * Refresh with query `str`.
 */

function refresh(str) {
  var query = es.query(str);

  query.on('data', function(log){
    log.message = JSON.stringify(log.message, null, 2);
    log.timestamp = moment(log.timestamp).format('Do h:mm:ss a');
    var el = dom(render(log));
    el.appendTo('#logs > tbody');
  });
}

/**
 * Clear the logs.
 */

function clear() {
  dom('#logs > tbody > tr').remove();
}

// bind "s" to focus input

k('s', function(e){
  e.preventDefault();
  dom('[name=query]')[0].focus();
});

// initialize

refresh('*');