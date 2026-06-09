import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    // On utilise un Signal Angular pour un contrôle de l'état ultra-performant
    isDarkMode = signal<boolean>(false);

    // On récupère l'identifiant de la plateforme (Browser ou Server)
    private platformId = inject(PLATFORM_ID);

    constructor() {
        // 💡 1. ON VÉRIFIE SI ON EST DANS LE NAVIGATEUR
        if (isPlatformBrowser(this.platformId)) {

            // Au chargement, on vérifie si l'utilisateur a déjà un choix enregistré
            const savedTheme = localStorage.getItem('theme');

            if (savedTheme) {
                this.isDarkMode.set(savedTheme === 'dark');
            } else {
                // Sinon, on s'adapte aux préférences du système d'exploitation
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.isDarkMode.set(prefersDark);
            }

            // 💡 2. L'effect est placé ici, il ne s'exécutera QUE sur le navigateur
            effect(() => {
                const darkModeActive = this.isDarkMode();
                const root = window.document.documentElement; // La balise <html>

                if (darkModeActive) {
                    root.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    root.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }

    // Méthode pour basculer d'un mode à l'autre
    toggleTheme() {
        // On sécurise aussi le clic, même si un robot de prerender ne clique pas
        if (isPlatformBrowser(this.platformId)) {
            this.isDarkMode.update((darkMode) => !darkMode);
        }
    }
}