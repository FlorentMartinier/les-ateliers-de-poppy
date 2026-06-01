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
        // Récupère la langue du navigateur (ex: 'en-US', 'fr-FR', 'en')
        const browserLang = navigator.language || (navigator as any).userLanguage || 'fr';

        // On extrait les deux premières lettres pour gérer "en-US" ou "en-GB" de la même manière
        const isEnglish = browserLang.toLowerCase().startsWith('en');

        // Choix du fichier en fonction du résultat
        const jsonFile = isEnglish ? 'content-en.json' : 'content.json';

        return this.http.get<SiteConfig>(`./assets/${jsonFile}`);
    }
}