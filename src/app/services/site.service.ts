import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SiteConfig } from '../models/site.models';

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    constructor(private http: HttpClient) { }

    private platformId = inject(PLATFORM_ID);

    getSiteConfig(): Observable<SiteConfig> {
        let url = `./assets/content.json`;

        if (isPlatformServer(this.platformId)) {
            try {
                // On charge le module de système de fichiers de Node.js de manière dynamique
                const fs = require('fs');
                const path = require('path');

                // On pointe directement vers le vrai fichier sur ton disque dur
                const jsonPath = path.join(process.cwd(), 'src', 'assets', 'content.json');
                const rawData = fs.readFileSync(jsonPath, 'utf8');
                const configData = JSON.parse(rawData) as SiteConfig;

                // On renvoie directement les données sous forme d'Observable sans faire de requête HTTP
                return of(configData);
            } catch (error) {
                console.error("Erreur lors de la lecture locale du JSON au build :", error);
            }
        } else if (isPlatformBrowser(this.platformId)) {
            const browserLang = navigator.language || (navigator as any).userLanguage || 'fr';
            const isEnglish = browserLang.toLowerCase().startsWith('en');
            url = isEnglish ? `./assets/content-en.json` : `./assets/content.json`;
        }

        return this.http.get<SiteConfig>(url);
    }
}