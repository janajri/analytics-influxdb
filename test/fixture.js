var express = require('express');
var httpProxy = require('http-proxy');
var http = require('http');
var debug = require('debug')('analytics-node:server')
var ports = exports.ports = { source: 4063, proxy: 4064 };