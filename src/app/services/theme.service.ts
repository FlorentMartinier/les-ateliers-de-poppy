import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    // On utilise un Signal Angular pour un contrôle de l'état ultra-performant
    isDarkMode = signal<boolean>(false);

    constructor() {
        // 1. Au chargement, on vérifie si l'utilisateur a déjà un choix enregistré
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            this.isDarkMode.set(savedTheme === 'dark');
        } else {
            // Sinon, on s'adapte aux préférences du système d'exploitation de son ordinateur/téléphone
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.isDarkMode.set(prefersDark);
        }

        // 2. Un "effect" Angular qui s'exécute automatiquement dès que le signal change
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

    // Méthode pour basculer d'un mode à l'autre
    toggleTheme() {
        this.isDarkMode.update((darkMode) => !darkMode);
    }
}