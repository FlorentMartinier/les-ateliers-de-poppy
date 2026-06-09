import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { INITIAL_CONFIG } from '@angular/platform-server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: INITIAL_CONFIG,
      useValue: {
        url: 'http://localhost:4200' // Ou n'importe quelle URL valide, Angular s'en servira pour résoudre le chemin des assets en local
      }
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
