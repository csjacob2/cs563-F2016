import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http'; 
import { Observable } from 'rxjs';

@Injectable()
export class ClassifierService {
    constructor(private http: Http) { 
    }
    
    public classifyComment(comment: string): Observable<Array<string>> {
        var headers = new Headers({'Content-Type': 'application/json'}); 
        var options = new RequestOptions({headers: headers});
        var body = JSON.stringify({article: comment}); 
        return this.http.post('http://localhost:8080/api/classify', body, options )
                        .map((res: Response) => {
                              let body = res.json();
                              return body.categories || [];
                        }); 
    }

    public getCategories(): Observable<Array<string>> {
        var headers = new Headers({'Content-Type': 'application/json'}); 
        var options = new RequestOptions({headers: headers});
        return this.http.get('http://localhost:8080/api/categories', options )
                        .map((res: Response) => {
                              let body = res.json();
                              return body.categories || [];
                        }); 
    }
}


