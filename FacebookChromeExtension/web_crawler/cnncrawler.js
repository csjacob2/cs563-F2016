var yakuza = require('yakuza'); 
var cheerio = require('cheerio');
var retry = require('retry'); 


yakuza.scraper('cnnScraper')
    .addShareMethod('joinInArray', function (currentValue, newValue) {
        if (currentValue === undefined) {
          currentValue = {};
        }
        
        for (var key in newValue){
            if(newValue.hasOwnProperty(key)){
                if (currentValue.hasOwnProperty(key)) {
                    currentValue[key].categories.concat(newValue[key].categories); 
                }else {
                    currentValue[key] = newValue[key]; 
                }
            }
        }
        return currentValue; 
      }); 

yakuza.agent('cnnScraper', 'cnnAgent').plan([
    'grabCategoryLinks',
    {taskId: 'grabCategoryArticleLinks', selfSync: false},
    {taskId: 'grabArticleWordBags', selfSync: false}
]);

yakuza.task('cnnScraper', 'cnnAgent', 'grabCategoryLinks')
    .main(function (task, http, params) {
        http.get('www.cnn.com', function (err, res, body) {
            var $, categoryLinks;

            if (err) {
              task.fail(err, 'Request returned an error');
              return; // we return so that the task stops running
            }

            $ = cheerio.load(body);

            categoryLinks = [];

            $('.m-footer__title__link').each(function ($category) {
                var link = $(this).attr('href');
                if (!link.includes('bleacher') && !link.includes('more')
                                               && !link.includes('videos')
                                               && !link.includes('opinion')
                                               && !link.includes('travel')) {
                    if (link.includes('//')) {
                        var newLink = link.replace('//','');
                        if (newLink.includes('technology')){
                            categoryLinks.push({link: newLink, category: 'technology'});
                        }
                        else {
                            var category = newLink.replace('.cnn.com',''); 
                            categoryLinks.push({link: newLink, category: category});
                        }
                    } 
                    else if (link !== '/') {
                        var newLink = 'www.cnn.com' + link; 
                        var category = link.replace('/',''); 
                        categoryLinks.push({link: newLink, category: category});
                    }
                }
            });
            task.share('categoryLinks', categoryLinks); 
            task.success(categoryLinks);
        });   
    }); 

yakuza.task('cnnScraper', 'cnnAgent', 'grabCategoryArticleLinks')
    .builder(function (job) {
        var categoryLinks = job.shared('grabCategoryLinks.categoryLinks'); 
        return categoryLinks;  
    })
    .main(function (task, http, params) {
        var category = params; 
        console.log('Now grabbing articles for: ' + category.category); 

        var operation = retry.operation({ retries: 20, minTimeout: 1000, maxTimeout: 5000 }); 
        operation.attempt((currentAttempt) => {
            if (category !== undefined){
                http.get({url: category.link, open_timeout: 3000}, function (err, res, body) {
                    var $, articleLinks;
                    if (operation.retry(err)) {
                        console.log('retry'); 
                        return; 
                    }

                    articleLinks = grabArticleLinksFromBody(body, category);
                    console.log('Found ' + Object.keys(articleLinks).length + ' articles for ' + category.category); 
                    task.share('articleLinks', articleLinks, {method: 'joinInArray'}); 
                    task.success(articleLinks);
                });   
            }
        }); 
    }); 

yakuza.task('cnnScraper', 'cnnAgent', 'grabArticleWordBags')
    .builder(function (job) {
        var articles = job.shared('grabCategoryArticleLinks.articleLinks');
        var articleLinks = []; 
        console.log(Object.keys(articles).length); 
        for (var article in articles) {
            articleLinks.push(articles[article]); 
        } 
        return articleLinks;  
    })
    .main(function (task, http, params) {
        var articleLink = params;
        console.log('Now beginning to process: ' + articleLink.link); 

        var operation = retry.operation({ retries: 10, factor: 2, minTimeout: 1000, maxTimeout: 60000 }); 
        operation.attempt((currentAttempt) => {
            http.get({url: articleLink.link, open_timeout: 1500, read_timeout: 2000}, function (err, res, body) {
                console.log('Now processing ' + articleLink.link); 
                var $, docs;
                
                if (operation.retry(err)) {
                    console.log('retry'); 
                    return; 
                }

                $ = cheerio.load(body);

                docs = [];

                var title = $('.pg-headline').text(); 
                var doc = '';
                $('.zn-body__paragraph').each(function ($article) {
                    var docText = $(this).text();
                    doc += docText; 
                });
                task.success({docName: title, docText: doc, docCategory: articleLink.categories, url: articleLink.link});
            });   
        }); 
    }); 


function grabArticleLinksFromBody(body, category){
    var articleLinks = {}; 
    var matches = body.match(/\/[0-9][0-9][0-9][0-9]\/[0-9][0-9]\/[0-9][0-9]\/.{1,100}index.html/g); 
    for (var i = 0; i < matches.length; ++i){
        var link = matches[i];
        if (!link.includes('http') && !link.includes('profile') && !link.includes('videos')) {
            var newLink = 'www.cnn.com' + link; 
            if (category.category === 'money'){
                newLink = 'www.money.cnn.com' + link;
            }
            else if (category.category === 'technology'){
                newLink = 'www.money.cnn.com/technology' + link; 
            }
            articleLinks[newLink] = {categories: [category.category], link: newLink};
        }
    }

    return articleLinks; 
}


module.exports = {Yakuza: yakuza}; 

