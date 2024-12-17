const express = require("express");
const app = express(';');
const bodyParser = require("body-parser");
const connection = require("./database/connection");

const articlesController = require('./articles/ArticlesController');
const categoriesController = require('./categories/CategoriesController');

const Article = require('./articles/Article');
const Category = require("./categories/Category");

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());

connection.authenticate().then(() => {
    console.log("Conectado com sucesso!")
}).catch((error) => {
    console.error();
})

app.use("/", categoriesController);

app.use("/", articlesController);

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
                categories: categories
            });
        })
    })
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
                    categories: categories
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
                    categories: categories
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