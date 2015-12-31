'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _util = require('util');

var _ips = require('./ips');

var _ips2 = _interopRequireDefault(_ips);

exports['default'] = (0, _util.deprecate)(function (app) {
  app.loopback.modelBuilder.mixins.define('IPs', _ips2['default']);
}, 'DEPRECATED: Use mixinSources, see https://github.com/FluxAugur/loopback-ds-timestamp-mixin#mixinsources');
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
