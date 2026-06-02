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
        const browserLang = navigator.language || (navigator as any).userLanguage || 'fr';
        const isEnglish = browserLang.toLowerCase().startsWith('en');
        const jsonFile = isEnglish ? 'content-en.json' : 'content.json';

        return this.http.get<SiteConfig>(`./assets/${jsonFile}`);
    }
}