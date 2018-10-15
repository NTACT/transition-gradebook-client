import { observable, action, computed, autorun } from 'mobx';

const states = {
  unstarted: 'unstarted',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected',
};

const production = process.env.NODE_ENV === 'production';

// For reacting to state changes in asynchronous tasks.
// AsyncTask instances like promises. They have `then` and `catch` methods
// and work fine with async/await.
export default class AsyncTask {
  _body = null;
  _promise = null;
  _result = null;
  _error = null;

  static resolve(result) {
    return new AsyncTask(Promise.resolve(result));
  }

  static reject(error) {
    return new AsyncTask(Promise.reject(error));
  }

  // Observable promise state with computed properties for convenience
  @observable state = states.unstarted;

  // The `error`/`result` getters allow changes to `_error` and `_result` to be
  // observed without making them (and their properties) directly observable.
  @computed get error() {
    return this.rejected && this._error;
  }

  @computed get result() {
    return this.resolved && this._result;
  }

  @computed get pending()   { return this.state === states.pending;   }
  @computed get resolved()  { return this.state === states.resolved;  }
  @computed get rejected()  { return this.state === states.rejected;  }
  @computed get unstarted() { return this.state === states.unstarted; }
  @computed get started()   { return this.state !== states.unstarted; }
  @computed get finished()  { return this.resolved || this.rejected;  }
  @computed get errorMessage() {
    if(this.rejected) {
      return this.error ? this.error.message || this.error.toString() : 'Unknown error';
    }
    return '';
  }

  constructor(body) {
    if(!production) this._startTime = Date.now();
    if(body && body.then) {
      // Pass a promise, start immediately.
      this._promise = this._wrapPromise(body);
    } else if(typeof body === 'function') {
      // Pass a function, wait until `start` is called run the function and start.
      // This allows AsyncTask to be used as a lazily executed promise.
      this._body = body;
    } else if(body instanceof Error) {
      // pass an error, start in the rejected state.
      this._error = body;
      this.state = states.rejected;
      this._promise = this._wrapPromise(Promise.reject(body));
    } else {
      // pass anything else, start immediately in the resolved state.
      this._result = body;
      this.state = states.resolved;
      this._promise = this._wrapPromise(Promise.resolve(body));
    }
  }

  match(matchMap) {
    switch(this.state) {
      case states.pending: return matchMap.pending && matchMap.pending();
      case states.resolved: return matchMap.resolved && matchMap.resolved(this.result);
      case states.rejected: return matchMap.rejected && matchMap.rejected(this.error);
      default: return matchMap.unstarted && matchMap.unstarted();
    }
  }

  then(resultHandler, errorHandler) {
    return this.start()._promise.then(resultHandler, errorHandler);
  }

  catch(errorHandler) {
    return this.start()._promise.catch(errorHandler);
  }

  inspect(description) {
    if(!production) {
      description = description || this._body.name;
      const endInspection = autorun(() => {
        if(this.finished) {
          const elapsed = Date.now() - this._startTime;
          console.log('Task', this.state, `"${description}" (${elapsed}ms)`, this._error || this._result);
          endInspection();
        }
      });
    }

    return this;
  }

  start() {
    if(!this._promise) {
      this._promise = this._wrapPromise(this._body.apply(null, arguments));
    }
    return this;
  }

  @action _wrapPromise(promise) {
    this.state = states.pending;
    return Promise.resolve(promise).then(this._handleResolve, this._handleReject);
  }

  @action.bound _handleResolve(result) {
    this._result = result;
    this.state = states.resolved;
    return result;
  }

  @action.bound _handleReject(error) {
    this._error = error;
    this.state = states.rejected;
    throw error;
  }
}

export function task(description) {
  // allow calling as @task or @task(debugName)
  if(arguments.length === 3) {
    description = null;
    return taskDecorator.apply(null, arguments);
  } else {
    return taskDecorator;
  }

  function taskDecorator(target, key, descriptor) {
    return action.bound(target, key, {
      ...descriptor,
      value() {
        const asyncTask = new AsyncTask(descriptor.value.apply(this, arguments));
        if(!global.PRODUCTION && description) asyncTask.inspect(description);
        return asyncTask.start();
      },
    });
  }
}
