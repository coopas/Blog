const express = require("express");
const app = express(';');
const bodyParser = require("body-parser");
const session = require('express-session');
const connection = require("./database/connection");

const articlesController = require('./articles/ArticlesController');
const categoriesController = require('./categories/CategoriesController');
const usersController = require('./users/UsersController');

const Article = require('./articles/Article');
const Category = require("./categories/Category");
const adminAuth = require("./middlewares/adminAuth");

app.set('view engine', 'ejs');

app.use(session({
    secret: "copas",
    cookie: {maxAge: 86400000 },
    resave: true,
    saveUninitialized: true
}))

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

connection.authenticate().then(() => {
    console.log("Conectado com sucesso!")
}).catch((error) => {
    console.error();
})

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', {
                articles: articles,
                categories: categories,
                req: req
            });
        })
    })
})

app.get("/admin", adminAuth, (req, res) => {
    res.render("admin")
})

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', {
                    article: article,
                    categories: categories,
                    req: req
                });
            })
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    })
})

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then( category => {
        if(category != undefined) {

            Category.findAll().then(categories => {
                res.render('index', {
                    articles: category.articles,
                    categories: categories,
                    req: req
                });
            })

        } else {
        res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    })
})

app.listen(8080, () => {
    console.log("Servidor foi iniciado");
})