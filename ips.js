'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ipware = require('ipware');

var _ipware2 = _interopRequireDefault(_ipware);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  debug('Ips mixin for Model %s', Model.modelName);

  options = _extends({ createdByIp: 'createdByIp', updatedByIp: 'updatedByIp', required: true }, options);

  debug('options', options);

  debug('Model.settings.validateUpsert', Model.settings.validateUpsert);
  if (Model.settings.validateUpsert && options.required) {
    console.warn('IPs mixin requires validateUpsert be false. See @clarkbw/loopback-ds-timestamp-mixin#10');
  }
  Model.settings.validateUpsert = false;

  Model.defineProperty(options.createdByIp, { type: String, required: options.required });
  Model.defineProperty(options.updatedByIp, { type: String, required: options.required });

  Model.observe('before save', function (ctx, next) {
    debug('ctx.options', ctx.options);
    if (ctx.options && ctx.options.skipUpdatedAt) {
      return next();
    }

    var ip = getClientIp(ctx, next);

    if (ctx.instance) {
      if (ctx.isNewInstance) {
        debug('%s.%s: [%s][%s]', ctx.Model.modelName, options.createdByIp, ctx.instance.id, ip);
        debug('%s.%s before create: %s', ctx.Model.modelName, options.createdByIp, ctx.instance.id);
        ctx.instance[options.createdByIp] = ip;
      } else {
        debug('%s.%s: [%s][%s]', ctx.Model.modelName, options.updatedByIp, ctx.instance.id, ip);
        debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedByIp, ctx.instance.id);
        ctx.instance[options.updatedByIp] = ip;
      }
    } else {
      debug('%s.%s: [%j][%s]', ctx.Model.pluralModelName, options.updatedByIp, ctx.where, ip);
      debug('%s.%s before update matching %j', ctx.Model.pluralModelName, options.updatedByIp, ctx.where);
      ctx.data[options.updatedByIp] = ip;
    }
    next();
  });

  function getClientIp(ctx, next) {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (ctx.req) {
      return (0, _ipware2.default)().get_ip(req).clientIp;
    } // jshint ignore:line
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return next();
  }
};
//# sourceMappingURL=ips.js.map
