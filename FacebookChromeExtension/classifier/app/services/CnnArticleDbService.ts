/// <reference path="../../../typings/globals/nedb/index.d.ts" />
import Datastore = require('nedb');

export class CnnArticleDbService {
    private cnnDb:Datastore; 

    constructor() { 
        this.cnnDb = new Datastore({filename: process.cwd() + '/web_crawler/cnnArticles.db', autoload: true}); 
    }
    
    public getCategories(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.cnnDb.find({}, function (err:Error, docs:Array<any>) {
                var uniqueCategories = {}; 
                for (var i=0; i < docs.length; i++) {
                    for(var j=0; j < docs[i].articleCategory.length; ++j){
                        if (uniqueCategories[docs[i].articleCategory[j]]) {
                            uniqueCategories[docs[i].articleCategory[j]] += 1; 
                        }
                        else {
                            uniqueCategories[docs[i].articleCategory[j]] = 1; 
                        }
                    }
                }
                resolve(uniqueCategories); 
            });
        }); 
    }

    public getAllArticles(): Promise<Array<CnnArticle>> {
        return new Promise<Array<CnnArticle>>((resolve, reject) => {
            this.cnnDb.find({}, function (err:Error, docs:Array<any>) {
                resolve(docs); 
            });
        }); 
    }

    public getArticlesByCategory(category: string): Promise<Array<CnnArticle>> {
        return new Promise<Array<CnnArticle>>((resolve, reject) => {
            this.cnnDb.find({articleCategory: [category]}, function (err:Error, docs:Array<any>) {
                resolve(docs); 
            });
        }); 
    }

    public getArticlesNotHavingCategory(category: string): Promise<Array<CnnArticle>> {
        return new Promise<Array<CnnArticle>>((resolve, reject) => {
            this.cnnDb.find({articleCategory: [category]}, function (err:Error, docs:Array<any>) {
                resolve(docs); 
            });
        }); 
    }
}

export interface CnnArticle {
    _id: string; 
    articleText: string; 
    articleCategory: Array<string>; 
    docUrl: string; 
}
