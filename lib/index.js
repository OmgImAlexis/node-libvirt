import bindings from 'bindings';
import { EventEmitter } from 'events';
import { inherits } from 'utils';

const libvirt = bindings('libvirt');

export class LibvirtError extends Error {
  constructor(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
};

const errorHandler = error => {
  const newError = new LibvirtError(error.message);
  for (let key in error) {
    newError[key] = error[key];
  }
  throw newError;
};

const promisifyOptions = {
  promisifier: function(originalFunction, defaultPromisifer) {
    var promisified = defaultPromisifer(originalFunction);
    return function() {
      return promisified.apply(this, arguments).catch(errorHandler);
    };
  }
};

Promise.promisifyAll(libvirt.Hypervisor.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.Domain.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.NodeDevice.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.Interface.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.Network.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.NetworkFilter.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.Secret.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.StoragePool.prototype, promisifyOptions);
Promise.promisifyAll(libvirt.StorageVolume.prototype, promisifyOptions);

inherits(libvirt.Domain, EventEmitter);

/*
 * A helper method returning an 'all domains' promise.
 */
libvirt.Hypervisor.prototype.getAllDomains = function() {
  return Promise.join([ this.listDefinedDomainsAsync(), this.listActiveDomainsAsync() ])
    .spread((defined, active) => defined.concat(active))
    .spread((defined, active) => {
      return Promise.all([
        Promise.map(defined, domain => this.lookupDomainByNameAsync(domain)),
        Promise.map(active, domain => this.lookupDomainByIdAsync(domain))
      ]);
    })
    .spread(function(defined, active) { return defined.concat(active); });
};

libvirt.Promise = Promise;
libvirt.startEventLoop = libvirt.setupEvent,
libvirt.createHypervisor = (uri, options) => new libvirt.Hypervisor(uri, options);

export default libvirt;
