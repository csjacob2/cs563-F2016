import { DocumentCategoryClassifier } from './app/DocumentCategoryClassifier';
import { DocumentClassifierEvaluator } from './app/DocumentClassifierEvaluator';
var express = require('express'); 
var http = require('http'); 
var bodyParser =  require('body-parser'); 

var app = express();

var port = 8080; 

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next(); 
}); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/api/classify', function(req, res) {
    (function (req, res) { 
        var classifier = new DocumentCategoryClassifier(); 
        classifier.classifyComment(req.body.article)
              .then((result) => {
                var response = JSON.stringify({categories: result}); 
                res.end(response); 
              })})(req, res); 
});

app.get('/api/train_classifiers', function(req, res) {
    var classifier = new DocumentCategoryClassifier(); 
    classifier.trainClassifierWithCnnArticleDb(); 
    res.end(); 
}); 

app.get('/api/evaluate_classifiers', function(req, res) {
    var evaluator = new DocumentClassifierEvaluator(); 
    evaluator.evaluateClassifier(); 
    res.end(); 
}); 

app.get('/api/evaluate_classifiers_mn', function(req, res) {
    var evaluator = new DocumentClassifierEvaluator(); 
    evaluator.evaluateClassifierMultinomial(); 
    res.end(); 
}); 

app.get('/api/categories', function(req, res) {
    (function (req, res) { 
        var classifier = new DocumentCategoryClassifier(); 
        classifier.getCategories()
              .then((result) => {
                var response = JSON.stringify({categories: result}); 
                res.end(response); 
              })})(req, res); 
});
app.listen(port); 

console.log('Server started! At http://localhost:' + port);

