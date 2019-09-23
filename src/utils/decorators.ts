import * as glob from 'glob';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as Schema from 'validate';

type HTTPMethod = 'get' | 'put' | 'del' | 'post' | 'patch';
type LoadOptions = {
    extname?: string;
}
type RouteOptions = {
    prefix?: string;
    middlewares?: Array<Koa.Middlewares>;
}

const router = new KoaRouter();
const decorate = (method: HTTPMethod, path: string, options: RouteOptions = {}, router: KoaRouter) => {
    return (target, property: string) => {
        process.nextTick(() => {
            const middlewares = [];
            if (options.middlewares) {
                middlewares.push(...options.middlewares);
            }

            if (target.middlewares) {
                middlewares.push(...target.middlewares);
            }
            middlewares.push(target[property])
            const url = options.prefix ? options.prefix + path : path;
            router[method](url, ...middlewares);
        })

    }
};
const method = method => (path: string, options?: RouteOptions) => decorate(method, path, options, router);
export const get = method('get');
export const post = method('post');
export const put = method('put');
export const del = method('del');
export const patch = method('patch');

export const middlewares = function (midllewares: Koa.Middlewares[]) {
    return function (target) {
        target.prototype.middlewares = midllewares;
    }
}
export const load = (folder: string, options: LoadOptions = {}): KoaRouter => {
    const extname = options.extname || '.{js,ts}';
    glob.sync(require('path').join(folder, `./**/*${extname}`)).forEach((item) => {
        require(item);
    });
    return router;
}
const validate = param => rule => {

    return (target: any, property: string, descriptor: PropertyDescriptor) => {
        let oldValue = descriptor.value;
        descriptor.value = function () {
            console.log(arguments);
            const ctx = arguments[0];
            let params = ctx.request[param];
            console.log(params);
            console.log(rule);
            const validator = new Schema(rule);
            const errors = validator.validate(params);
            if (errors && errors.length > 0) {
                throw new Error(errors)
            }
            return oldValue.apply(null, arguments);
        }
    }

};
export const query = validate('query');
export const body = validate('body');
