import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpRequest } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FileService {

    constructor(private http: HttpClient) {}

    public uploadTemp(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file);
    
        // const req = new HttpRequest('POST', `${API}/files/temp`, formData, {
        //   reportProgress: true,
        //   responseType: 'json',
        // });
    
        return this.http.post(`${API}/files/temp`, formData).pipe(shareReplay(1));
    }
}