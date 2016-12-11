/// <reference path="../../typings/globals/natural/index.d.ts" />
import { BayesClassifier } from 'natural';
import { CnnArticleDbService, CnnArticle } from'./services/CnnArticleDbService'; 
import { ClassifierStatistics } from'./models/ClassifierStatistics'; 

export class DocumentCategoryClassifier {
    protected cnnDb: CnnArticleDbService; 
    protected categories:Array<any>; 
    protected trainingSet:Array<CnnArticle>; 
    protected threshold: number = .05; 
    
    constructor() { 
    }
    
    public classifyComment(comment: string): Promise<Array<any>> {
        return new Promise<Array<any>>((resolve, reject) => {
            this.cnnDb = new CnnArticleDbService();
            this.cnnDb.getCategories()
                      .then((cats) => {
                          this.categories = cats; 
                          this.getCategoriesForComment(comment)
                              .then((classifications) => {
                                  resolve(classifications); 
                              }); 
                      });  
        });
    }

    public getCategories(): Promise<Array<any>> {
        return new Promise<Array<any>>((resolve, reject) => {
            this.cnnDb = new CnnArticleDbService();
            this.cnnDb.getCategories()
                      .then((cats) => {
                          resolve(cats); 
                      });  
        });
    }

    public trainClassifierWithCnnArticleDb(): void {
        this.loadDatabase()
            .then((values) => {
                this.categories = values[0]; 
                this.trainingSet = values[1]; 
                this.createClassifiersForEachCategory(); 
            });  
    }

    protected loadDatabase(): Promise<any> {
        this.cnnDb = new CnnArticleDbService();
        var categoriesPromise = this.cnnDb.getCategories(); 
        var loadTrainingSetPromise = this.cnnDb.getAllArticles(); 
        return Promise.all([categoriesPromise, loadTrainingSetPromise]);
    }

    private getCategoriesForComment(cmt: string): Promise<Array<any>> {
        return new Promise<Array<any>>((resolve, reject) => {
            var classifications = []; 
            var cnt = 0; 
            for (var cat in this.categories) {
                ((comment, category, count) => {
                    BayesClassifier.load(__dirname + '/' + category + '.json', null, (err: any, classifier: any): void => {
                        var classification = classifier.classify(comment); 
                        if (classification === 'true') {
                            classifications.push(category); 
                        } 
                        
                        if (count === (Object.keys(this.categories).length -1)){
                            resolve(classifications)
                        }
                    });  
                })(cmt, cat, cnt); 
                cnt++;
            }
        });
    }

    protected getCategoriesMultinomialForComment(classifier: any, comment: string): Array<any> {
        var classifications = classifier.getClassifications(comment); 
        var categories = []; 
        for (let i =0; i < classifications.length; ++ i) {
            //console.log("Label: " + classifications[i].label + '  Value: ' + classifications[i].value); 
            if (classifications[i].value > this.threshold) {
                categories.push(classifications[i].label); 
            }
        }

        if (categories.length === 0) {
            categories.push(classifications[0].label); 
        }
        return categories; 
    }

    private createClassifiersForEachCategory(): void {
        for (var cat in this.categories) {
            var trueItems = this.getTrainingItemsOfCategory(cat, this.trainingSet); 
            var falseItems = this.getTrainingItemsNotOfCategory(cat, this.trainingSet); 
            console.log('Now building classifier for ' + cat); 
            var classifier = this.buildClassifier(trueItems, falseItems, cat);    
            this.saveClassifier(classifier, cat); 
        }
    }

    protected buildClassifierMultinomial(items: Array<CnnArticle>): any { 
        var classifier = new BayesClassifier();
        for (var i=0; i < items.length; ++i) {
            for (let j = 0; j < items[i].articleCategory.length; ++j) {
                classifier.addDocument(items[i].articleText, items[i].articleCategory[j]); 
            }
        }
        classifier.train(); 
        return classifier; 
    }

    protected buildClassifier(trueItems: Array<CnnArticle>, 
                            falseItems: Array<CnnArticle>, 
                            categoryName: string): any {
        var classifier = new BayesClassifier();
        for (var i=0; i < falseItems.length; ++i) {
            classifier.addDocument(falseItems[i].articleText, 'false'); 
        }
        for (var j=0; j < trueItems.length; ++j) {
            classifier.addDocument(trueItems[j].articleText, 'true'); 
        }
        classifier.train(); 
        return classifier; 
    }

    private saveClassifier(classifier: any, categoryName: string): void {
        classifier.save(__dirname + '/' + categoryName + '.json', () => {
            console.log('Classifier for category ' + categoryName + ' has been saved.'); 
        }); 
    }

    protected getTrainingItemsOfCategory(category: string, articles: Array<CnnArticle>): Array<CnnArticle> {
        return articles.filter((article) => {
            for (var i=0; i < article.articleCategory.length; ++i){
                if (article.articleCategory[i] === category){
                    return true;
                }
            }
            return false; 
        }); 
    }

    protected getTrainingItemsNotOfCategory(category: string, articles: Array<CnnArticle>): Array<CnnArticle> {
        return articles.filter((article) => {
            for (var i=0; i < article.articleCategory.length; ++i){
                if (article.articleCategory[i] === category){
                    return false;
                }
            }
            return true; 
        }); 
    }
}




