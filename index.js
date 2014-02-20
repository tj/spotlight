
/**
 * Module dependencies.
 */

var isNearBottom = require('is-near-bottom');
var throttle = require('throttle');
var moment = require('moment');
var conf = require('./config');
var ES = require('./client');
var dom = require('dom');
var k = require('k')(window);

/**
 * Options.
 */

var from = Date.now();
var autoscroll = true;
var tailing = true;
var query = '*';

// log template

var html = require('./log.html');
var min = require('minstache');
var render = min.compile(html);

// client

var es = new ES({
  url: conf.url
});

// query

dom('[name=query]').on('input', function(e){
  e.stopPropagation();
  query = this.value.trim() || '*';
  clear();
  disableTailing();
  fetch();
});

/**
 * Fetch and append logs.
 */

function fetch(opts) {
  opts = opts || {};

  if (opts.range) {
    var to = Date.now();
    var range = ' AND timestamp:[' + from + ' TO ' + to + ']';
    var q = es.query(query + range, { limit: 1e5 });
    from = to;
  } else {
    var q = es.query(query, { limit: 1000 });
  }

  q.on('data', function(log){
    var msg = JSON.parse(log.message);
    log.message = JSON.stringify(msg, null, 2);
    log.timestamp = moment(log.timestamp).format('Do h:mm:ss a');
    var el = dom(render(log));
    el.appendTo('#logs > tbody');
  });

  q.on('end', function(){
    if (autoscroll) scroll();
  });
}

/**
 * Toggle tailing.
 */

dom('#tail').on('click', function(e){
  e.preventDefault();
  toggle();
});

/**
 * Show help.
 */

dom('#info').on('click', function(e){
  e.preventDefault();
  toggleHelp();
});

/**
 * Lame query ticker.
 */

fetch({ range: true });
setInterval(function(){
  if (tailing) fetch({ range: true });
}, 1000);

// /**
//  * Lame autoscrolling logic.
//  */

// window.onscroll = throttle(function(){
//   autoscroll = isNearBottom(500);
//   console.log(autoscroll);
// }, 200);

/**
 * Toggle tailing.
 */

function toggleTailing() {
  tailing = !tailing;
  dom('#tail').toggleClass('down');
}

/**
 * Disable tailing.
 */

function disableTailing() {
  tailing = false;
  dom('#tail').removeClass('down');
}

/**
 * Toggle help display.
 */

function toggleHelp() {
  dom('#help').toggleClass('show');
  dom('#info').toggleClass('down');
}

/**
 * Scroll to the bottom.
 */

function scroll() {
  document.body.scrollTop = document.body.scrollHeight;
}

/**
 * Clear the logs.
 */

function clear() {
  dom('#logs > tbody > tr').remove();
}

/**
 * Bind "s" to the search input.
 */

k('s', function(e){
  e.preventDefault();
  dom('[name=query]').get(0).focus();
});

/**
 * Bind "t" to toggle tailing.
 */

k('t', function(e){
  e.preventDefault();
  toggleTailing();
});

/**
 * Bind "h" to toggle help.
 */

k('h', function(e){
  e.preventDefault();
  toggleHelp();
});
