// https://github.com/florent-formation/architecture.git

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const fs      = require("fs");
const path    = require("path");
const app     = express();
const port    = 3000;

const controllerPath = path.join(__dirname , "controllers");
const staticPath     = path.join(__dirname , "static");
const viewPath       = path.join( __dirname , "views" );


app.set("view engine",'ejs')
app.set("views", viewPath)

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    resave: false,
    secret: '@Ck34CMDaFD&okiQm6@&',
    cookie: { maxAge: oneDay },
    saveUninitialized: true,
}))



app.use(express.json())
app.use(express.urlencoded({extended:true}))
// cookie parser middleware
app.use(cookieParser());

app.use(express.static(staticPath))
app.use((req,res,next) => {
    res.data = {
        session:req.session
    }
    return next()
})

for (const fileName of fs.readdirSync(controllerPath)){
    const filePath   = path.join(controllerPath,fileName);
    const controller = require(filePath)

    for (const route of extractRoutes(controller.toString())) {
        console.log("Controller",controller.name, route.url+":"+route.method,route.action, "registered")
        app[route.method](route.url,controller[route.action])
    }
}

app.use((req,res, next) => {
    // /            => index       => index.ejs
    // /hello/world => hello/world => hello/world.ejs
    if (path.extname(req.url) !== "") {
        return next()
    } 

    if (req.url === "/"){
        req.url = "/index"
    }

    res.render(req.url.replace("/",""),res.data)
})



app.listen(port,() => {
    console.log(`server is running on port: ${port}`);
})


function extractRoutes(str) {
    const routes = [];
    let currentRoute = {};
    const regex = /@url\s?=\s?(.*)|@method\s?=\s?(.*)|static\s(.*)\s?\(/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
        const [_, url, method, action] = match;
        if (url !== undefined) currentRoute.url = url;
        if (method !== undefined) currentRoute.method = method.toLowerCase();
        if (action !== undefined) currentRoute.action = action;
        if (currentRoute.url && currentRoute.method && currentRoute.action) {
            routes.push(currentRoute);
            currentRoute = {};
        }
    }

    return routes;
}



