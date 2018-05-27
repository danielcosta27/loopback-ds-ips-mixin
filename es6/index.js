import { deprecate } from 'util';
import ips from './ips';

export default deprecate(
  app => app.loopback.modelBuilder.mixins.definre('Ips', ips), 
  'DEPRECATED: Use mixinSources, see https://github.com/clarkbw/loopback-ds-timestamp-mixin#mixinsources'
);

module.exports = exports.default;
