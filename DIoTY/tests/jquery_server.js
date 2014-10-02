// JavaScript source code
// To check this API is inoked on server side or client side
var $ = require('jquery');
var util = require('util');

if (typeof module !== 'undefined') {
    // here is the server side code
    // set global $ to jQuery module
    console.log('I am on server: ' + util.inspect($.ajax));
}

var url = 'http://localhost:3000/api';

$.get(url, '', function (data, textStatus, jqXHR) {
    var prettyObject = JSON.parse(data);
    console.log(util.inspect(prettyObject));
}, 'json');