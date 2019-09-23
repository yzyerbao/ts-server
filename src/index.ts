import * as Koa from 'koa';
import * as bodify from 'koa-body';
import * as serve from 'koa-static';
import * as timing from 'koa-xtime';
import {Sequelize} from "sequelize-typescript";

import {load} from './utils/decorators';
import {resolve} from "path";

const app = new Koa();
app.use(timing());
app.use(bodify({
    multipart: true,
    strict: false
}));

const router = load(resolve(__dirname, './routes'));
app.use(router.routes());

app.use(serve(`${__dirname}/public`));

app.use((ctx: Koa.Context) => {
    ctx.body = 'hello';
});

app.listen(3000, () => {
    console.log('启动成功')
});

const database = new Sequelize({
    port: 3306,
    database: 'egg-server',
    username: 'root',
    password: '123456',
    dialect: 'mysql',
    modelPaths: [`${__dirname}/model`]
});
// database.sync({force:true})
