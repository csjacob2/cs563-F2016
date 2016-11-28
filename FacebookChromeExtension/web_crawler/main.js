var cnnCrawler = require('./cnncrawler.js');
var Datastore = require('nedb');

var cnnDb = new Datastore({filename: __dirname + '/cnnArticles.db', autoload: true});
var cnnArticles = []; 

var job = cnnCrawler.Yakuza.job('cnnScraper', 'cnnAgent');
job.enqueueTaskArray(['grabCategoryLinks', 'grabCategoryArticleLinks', 'grabArticleWordBags']);

job.on('task:grabCategoryArticleLinks:success', function(response){
    console.log(Object.keys(response.data).length); 
});

job.on('task:grabArticleWordBags:success', function(response){
    cnnArticle = response.data; 
    cnnDb.insert({_id: cnnArticle.docName, articleText: cnnArticle.docText, articleCategory: cnnArticle.docCategory, docUrl: cnnArticle.url }); 
});

job.on('task:grabCategoryLinks:fail', function(response){
    console.log(response); 
});

job.on('task:grabCategoryArticleLinks:fail', function(response){
    console.log(response); 
});

job.on('task:grabArticleWordBags:fail', function(response){
    console.log(response); 
});

job.on('job:success', function(response){
    console.log(); 
});

job.on('job:fail', function(response){
    console.log('job failed'); 
});

job.run();
