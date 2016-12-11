/// <reference path="../../typings/globals/natural/index.d.ts" />
import { BayesClassifier } from 'natural';
import { CnnArticleDbService, CnnArticle } from'./services/CnnArticleDbService'; 
import { ClassifierStatistics } from'./models/ClassifierStatistics'; 
import { DocumentCategoryClassifier } from'./DocumentCategoryClassifier'; 

export class DocumentClassifierEvaluator extends DocumentCategoryClassifier{
    constructor() { 
        super(); 
    }
    
    public evaluateClassifier(): void {
        this.loadDatabase()
            .then((values) => {
                this.categories = values[0]; 
                this.trainingSet = values[1]; 
                this.evaluateClassifierInternal();
            });  
    }

    public evaluateClassifierMultinomial(): void {
        this.loadDatabase()
            .then((values) => {
                this.categories = values[0]; 
                this.trainingSet = values[1]; 
                this.evaluateClassifierInternalMulitnomial();
            });  
    }

    private evaluateClassifierInternalMulitnomial(): void {
       var chunkSize = Math.floor((this.trainingSet.length / 10)); 
       console.log('The chunk size is: ' + chunkSize); 
       var stats = []; 
       var chunks =  this.chunkArrayOfAritcles(chunkSize, this.trainingSet); 
       for (let i = 0; i < chunks.length; ++i) {
           var trainingSet = [].concat.apply([], chunks.filter((value, idx) => { 
               return idx !== i; 
           }));
           let testingSet = chunks[i]; 
           let classifier = this.buildClassifierMultinomial(trainingSet); 
           let classifierStats = this.getClassifierStatisticsMultinomial(classifier, testingSet); 
           stats.push(classifierStats);  
       }
       var result = this.getClassifierStatisticAverages(stats); 
       console.log('Results: '); 
       console.log(result); 
    }

    private evaluateClassifierInternal(): void {
       var chunkSize = Math.floor((this.trainingSet.length / 10)); 
       console.log('The chunk size is: ' + chunkSize); 
       var chunks =  this.chunkArrayOfAritcles(chunkSize, this.trainingSet); 
       var categories = Object.keys(this.categories);
       for(let i = 0; i < categories.length; ++i){
           var result = this.evaluateClassifierForCategory(categories[i], chunks); 
           console.log('Results: '); 
           console.log(result); 
       }
    }

    private evaluateClassifierForCategory(category: string, chunks: Array<Array<CnnArticle>>): ClassifierStatistics {
        console.log('Now evaluating category: ' + category); 
        var stats = []; 
        for (let i = 0; i < chunks.length; ++i) {
            var trainingSet = [].concat.apply([], chunks.filter((value, idx) => { 
                return idx !== i; 
            }));
            let testingSet = chunks[i]; 
            let trainingSetPositives = this.getTrainingItemsOfCategory(category, trainingSet); 
            let trainingSetNegatives = this.getTrainingItemsNotOfCategory(category, trainingSet); 
            let classifier = this.buildClassifier(trainingSetPositives, trainingSetNegatives, category); 
            let classifierStats = this.getClassifierStatistics(classifier, testingSet, category); 
            stats.push(classifierStats);  
        }

        return this.getClassifierStatisticAverages(stats); 
    }

    private getClassifierStatisticAverages(statistics: Array<ClassifierStatistics>): ClassifierStatistics {
        var tp, fp, tn, fn, recall, precision, f1; 
        tp = fp = tn = fn = recall = precision = f1 =  0; 
        for (let i =0; i < statistics.length; ++i) {
            tp += statistics[i].TruePositive; 
            fp += statistics[i].FalsePositive; 
            tn += statistics[i].TrueNegative; 
            fn += statistics[i].FalseNegative; 
            recall += statistics[i].Recall; 
            precision += statistics[i].Precision; 
            f1 += statistics[i].FScore; 
        }
        var result = new ClassifierStatistics(); 
        var totalStats = statistics.length; 
        result.TruePositive = tp / totalStats;
        result.FalsePositive = fp / totalStats; 
        result.TrueNegative = tn / totalStats; 
        result.FalseNegative = fn /totalStats;
        result.Recall = recall / totalStats; 
        result.Precision = precision / totalStats; 
        result.FScore = f1 / totalStats; 

        return result; 
    }

    private getClassifierStatisticsMultinomial(classifier: any, testingSet: Array<CnnArticle>): ClassifierStatistics {
        var tp, fp, tn, fn; 
        tp = fp = tn = fn = 0; 
        for (let i = 0; i < testingSet.length; ++i) {
            var result = this.getCategoriesMultinomialForComment(classifier, testingSet[i].articleText); 
            if(this.doSetsInterset(result, testingSet[i].articleCategory)) {
                tp += 1; 
            }
            else {
                fp += 1; 
            }
        }
        var values = new ClassifierStatistics(); 
        values.TruePositive = tp;
        values.FalsePositive = fp; 
        values.Precision =  tp / (tp + fp);
        values.Accuracy = tp / testingSet.length; 

        return values; 
    } 

    private doSetsInterset(array1: Array<any>, array2: Array<any>): boolean {
        var result = false; 
        for (let j = 0; j < array1.length; ++j) {
            if (array2.indexOf(array1[j]) > -1) {
                result = true; 
            }
        }
        return result; 
    }

    private getClassifierStatistics(classifier: any, testingSet: Array<CnnArticle>, category: string): ClassifierStatistics {
        var tp, fp, tn, fn; 
        tp = fp = tn = fn = 0; 
        for (let i = 0; i < testingSet.length; ++i) {
            var result = classifier.classify(testingSet[i].articleText); 
            //console.log('Result: ' + result + ' actual category: ' + testingSet[i].articleCategory + '  assessed category: '+ category); 
            if (result === 'true' && testingSet[i].articleCategory.indexOf(category) > -1) {
                tp += 1; 
            }
            else if (result === 'true' && testingSet[i].articleCategory.indexOf(category) === -1) {
                fp += 1; 
            }
            else if (result === 'false' && testingSet[i].articleCategory.indexOf(category) === -1) {
                tn += 1; 
            }
            else if (result === 'false' && testingSet[i].articleCategory.indexOf(category) > -1) {
                fn += 1; 
            }
        }
        var values = new ClassifierStatistics(); 
        values.TruePositive = tp;
        values.FalsePositive = fp; 
        values.TrueNegative = tn; 
        values.FalseNegative = fn;
        values.Precision =  tp / (tp + fp);
        values.Recall = tp / (tp + fn); 
        values.Accuracy = (tp + tn) / testingSet.length; 
        values.FScore = 2 * ((values.Precision * values.Recall) / (values.Precision + values.Recall)); 

        return values; 
    } 
    
    private chunkArrayOfAritcles(chunkSize: number, articles: Array<CnnArticle>): Array<Array<CnnArticle>> {
        var i,j,tempArray,chunk = chunkSize;
        var chunks = []
        for (i=0,j=articles.length; i<j; i+=chunk) {
            tempArray = articles.slice(i,i+chunk);
            if (tempArray.length > (chunkSize * .75)) {
                chunks.push(tempArray);
            }
        }
        return chunks;
    }
}
