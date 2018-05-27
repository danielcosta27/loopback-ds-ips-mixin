'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _ips = require('./ips');

var _ips2 = _interopRequireDefault(_ips);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.deprecate)(function (app) {
  return app.loopback.modelBuilder.mixins.definre('Ips', _ips2.default);
}, 'DEPRECATED: Use mixinSources, see https://github.com/clarkbw/loopback-ds-timestamp-mixin#mixinsources');


module.exports = exports.default;
//# sourceMappingURL=index.js.map
