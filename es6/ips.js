import ipware from 'ipware';
import _debug from './debug';
const debug = _debug();

export default (Model, options = {}) => {

  debug('Ips mixin for Model %s', Model.modelName);

  options = Object.assign({createdByIp: 'createdByIp', updatedByIp: 'updatedByIp', required: true}, options);

  debug('options', options);

  debug('Model.settings.validateUpsert', Model.settings.validateUpsert);
  if (Model.settings.validateUpsert && options.required) {
    console.warn('IPs mixin requires validateUpsert be false. See @clarkbw/loopback-ds-timestamp-mixin#10');
  }
  Model.settings.validateUpsert = false;

  Model.defineProperty(options.createdByIp, {type: String, required: options.required});
  Model.defineProperty(options.updatedByIp, {type: String, required: options.required});

  Model.observe('before save', (ctx, next) => {
    debug('ctx.options', ctx.options);
    if (ctx.options && ctx.options.skipUpdatedAt) { return next(); }

    var ip = getClientIp(ctx /*, next */);

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

  function getClientIp(ctx /*, next */) {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (ctx.req) { return ipware().get_ip(req).clientIp; } // jshint ignore:line
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    //return next();
    return undefined;
  }

};
