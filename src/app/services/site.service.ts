import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SiteConfig } from '../models/site.models';

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    constructor(private http: HttpClient) { }

    getSiteConfig(): Observable<SiteConfig> {
        return this.http.get<SiteConfig>(`./assets/content.json`);
    }
}