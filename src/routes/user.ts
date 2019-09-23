import * as Koa from 'Koa';
import {get, post, middlewares, query, body} from '../utils/decorators';
import model from '../model/user';

const users = [{name: 'hehe', age: 20}, {name: 'haha', age: 30}];
@middlewares([
    async function guard(ctx: Koa.Context, next: () => Promise<any>) {
        console.log('guard', ctx.header);

        if (ctx.header.token) {
            await next();
        } else {
            throw "请登录";
        }
    }
])
export default class User {

    @get('/users')
    public async list(ctx: Koa.Context) {
        const users = await model.findAll();
        ctx.body = {ok: 1, data: users};
    }

    @get('/user')
    @query({
        id: {
            type: String,
            required: true
        }
    })
    public async show(ctx: Koa.Context) {
        let param = ctx.request.query;
        // const users = await model.findOne(param);
        ctx.body = {ok: 1, data: users[0]};
    }
    // @post('/users', {
    //     middlewares: [
    //         async function validation(ctx: Koa.Context, next: () => Promise<any>) {
    //             console.log(ctx.request.body);
    //             const name = ctx.request.body.name;
    //             if (!name) {
    //                 throw 'please input username';
    //             }
    //             await next();
    //         }
    //     ]
    // })
    @post('/users')
    @body({
        name: {
            type: String,
            required: true
        },
        age:{
            type:Number,
            required:true
        }
    })
    public add(ctx: Koa.Context) {
        console.log(ctx.request.body);
        model.create(ctx.request.body);
        // users.push(ctx.reuest.body);
        ctx.body = {ok: 1}
    };
}
