/// <reference path="../../typings/globals/natural/index.d.ts" />
import { BayesClassifier } from 'natural';
import { CnnArticleDbService, CnnArticle } from'./services/CnnArticleDbService'; 

export class DocumentCategoryClassifier {
    private cnnDb: CnnArticleDbService; 
    private categories:Array<any>; 
    private trainingSet:Array<CnnArticle>; 
    
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

    public trainClassifierWithCnnArticleDb(): void {
        this.cnnDb = new CnnArticleDbService();
        this.loadCategories();  
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

    private loadCategories(): void {
        this.cnnDb.getCategories()
                  .then((cats) => {
                      this.categories = cats; 
                      this.loadTrainingSet(); 
                  });  
    }

    private loadTrainingSet(): void {
        this.cnnDb.getAllArticles()
                  .then((articles) => {
                      this.trainingSet = articles; 
                      this.createClassifiersForEachCategory(); 
                  });  
    }

    private createClassifiersForEachCategory(): void {
        for (var cat in this.categories) {
            var trueItems = this.getTrainingItemsOfCategory(cat); 
            var falseItems = this.getTrainingItemsNotOfCategory(cat); 
            console.log('Now building classifier for ' + cat); 
            this.buildAndSaveClassifier(trueItems, falseItems, cat);    
        }
    }

    private buildAndSaveClassifier(trueItems: Array<CnnArticle>, 
                                   falseItems: Array<CnnArticle>, 
                                   categoryName: string): void {
        var classifier = new BayesClassifier();
        for (var i=0; i < falseItems.length; ++i) {
            classifier.addDocument(falseItems[i].articleText, 'false'); 
        }
        for (var j=0; j < trueItems.length; ++j) {
            classifier.addDocument(trueItems[j].articleText, 'true'); 
        }

        classifier.train(); 
        classifier.save(__dirname + '/' + categoryName + '.json', () => {
            console.log('Classifier for category ' + categoryName + ' has been saved.'); 
        }); 
    }

    private getTrainingItemsOfCategory(category: string): Array<CnnArticle> {
        return this.trainingSet.filter((article) => {
            for (var i=0; i < article.articleCategory.length; ++i){
                if (article.articleCategory[i] === category){
                    return true;
                }
            }
            return false; 
        }); 
    }

    private getTrainingItemsNotOfCategory(category: string): Array<CnnArticle> {
        return this.trainingSet.filter((article) => {
            for (var i=0; i < article.articleCategory.length; ++i){
                if (article.articleCategory[i] === category){
                    return false;
                }
            }
            return true; 
        }); 
    }
}




