/**
 * Simple ReactiveX implementation based on
 * https://medium.com/@fknussel/a-simple-observable-implementation-c9c809c89c69
 */

const fs = require('fs');

/*************************
 *        Observer       *
 *************************/

class Observer {
    constructor(handlers) {
        this.handlers = handlers; // next, error and complete logic
        this.isUnsubscribed = false;
    }

    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }

            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }

            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}

/*************************
 *       Observable      *
 *************************/

class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }

    error(cb) {
        this._error = cb;
        return this;
    }

    complete(cb) {
        this._complete = cb;
        return this;
    }

    subscribe(p) {
        let obs;
        if (typeof p === 'function') {
            obs = {};
            obs.error = this._error ? this._error : (err) => {
            };
            obs.complete = this._complete ? this._complete : () => {
            };
            obs.next = p;
        } else {
            obs = p;
        }
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }


    /**
     * Operators
     */

    map(transformation) {
        const stream = this;

        return new Observable((observer) => {
            const subscription = stream.subscribe({
                next: (value) => observer.next(transformation(value)),
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            });

            return subscription.unsubscribe;
        });
    }


    zip() {
        const size = arguments.length;
        const transformation = arguments[size - 1];
        const sources = [];
        sources.push(this);
        for (let i = 0; i < size - 1; i++) {
            sources.push(arguments[i]);
        }

        return new Observable((observer) => {
            const subscriptions = [];
            const vals = [];
            let count = 0;
            const finish = (i, v) => {
                vals[i] = v;
                count++;

                if (count >= size) {
                    observer.next(transformation.apply(null, vals));
                }
            };

            for (let i = 0; i < size; i++) {
                subscriptions.push(sources[i].subscribe({
                    next: (value) => finish(i, value),
                    error: (err) => observer.error(err),
                    complete: () => observer.complete()
                }));
            }


            return () => {
                for (let i = 0; i < subscriptions.length; i++) {
                    ssubscriptions.unsubscribe();
                }
            }
        });
    }
}

/*************************
 *       fromArray       *
 *************************/

Observable.from = (values) => {
    return new Observable((observer) => {
        values.forEach((value) => observer.next(value));

        observer.complete();

        return () => {
            console.log('Observable.from: unsubscribed');
        };
    });
};


/*************************
 *        interval       *
 *************************/

Observable.interval = (interval) => {
    return new Observable((observer) => {
        let i = 0;
        const id = setInterval(() => {
            observer.next(i++);
        }, interval);

        return () => {
            clearInterval(id);
            console.log('Observable.interval: unsubscribbed');
        };
    });
};

/*************************
 *       From FS       *
 *************************/

Observable.fs = {};

Observable.fs.exists = (path) => {
    return new Observable((observer) => {
        fs.exists(path, (v) => {
            observer.next(v);
        });

        return () => {
            console.log('Observable.fs.exists: unsubscribbed');
        };
    });
};

Observable.fs.readFile = (path, options) => {
    return new Observable((observer) => {
        fs.readFile(path, options, (err, v) => {
            if (err) {
                observer.error(err);
            } else {
                observer.next(v);
            }
        });

        return () => {
            console.log('Observable.fs.readFile: unsubscribbed');
        };
    });
};


const simplerx = {};
simplerx.Observer = Observer;
simplerx.Observable = Observable;

module.exports = simplerx;


