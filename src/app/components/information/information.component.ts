import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, DOCUMENT } from '@angular/core';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { InfoBlock, SafeVideoConfig, SiteSection } from '../../models/site.models';
import { CarrouselComponent } from '../carrousel/carrousel.component';

@Component({
  selector: 'app-information',
  imports: [CommonModule, CarrouselComponent],
  templateUrl: './information.component.html'
})
export class InformationComponent implements OnInit, OnChanges {
  @Input() section!: SiteSection;
  @Input() info!: InfoBlock;

  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  safeVideos: SafeVideoConfig[] = [];
  safeReviewsUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    this.updateSEO();
    this.injectCourseSchema();
    // Si le bloc contient des vidéos, on les sécurise toutes une par une
    if (this.info?.videos && this.info.videos.length > 0) {
      this.safeVideos = this.info.videos.map(video => ({
        title: video.title,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(video.url)
      }));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['info']) {
      this.updateSEO();
      this.injectCourseSchema();
      this.safeVideos = [];
      this.safeReviewsUrl = null;

      if (this.info?.videos && this.info.videos.length > 0) {
        this.safeVideos = this.info.videos.map(video => ({
          title: video.title,
          safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(video.url)
        }));
      }

      if (this.info?.googleReviewsUrl) {
        this.safeReviewsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.info.googleReviewsUrl);
      }
    }
  }

  /**
   * Détecte si le paragraphe du JSON est configuré comme un élément de liste
   */
  isListItem(text: string): boolean {
    if (!text) return false;
    return text.trim().startsWith('<tr>');
  }

  /**
   * Retire les balises <tr> et </tr> pour ne garder que le texte propre intérieur
   */
  cleanListItem(text: string): string {
    if (!text) return '';
    // Supprime proprement les tags d'ouverture et fermeture configurés dans le JSON
    return text.replace(/<tr>/g, '').replace(/<\/tr>/g, '').trim();
  }

  private updateSEO() {
    // 1. Gestion du titre de la page (<title>)
    const defaultTitle = `${this.section.menu_title} - Poppy in the Sky`;
    this.titleService.setTitle(this.section.seoTitle || defaultTitle);

    // 2. Gestion de la Meta Description
    const defaultDesc = `Découvrez l'atelier créatif : ${this.info.title} proposé par Poppy in the Sky.`;
    this.metaService.updateTag({
      name: 'description',
      content: this.section.seoDescription || defaultDesc
    });
  }

  // 3. Injecte les données structurées Schema.org pour Google
  private injectCourseSchema() {
    // On supprime l'ancien script s'il y en avait un (évite les doublons lors de la navigation)
    const existingScript = this.document.getElementById('seo-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // On prépare l'objet JSON-LD au format officiel Google
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": this.section.menu_title,
      "description": this.section.courseDescription || this.section.seoDescription,
      "provider": {
        "@type": "LocalBusiness",
        "name": "Poppy in the Sky",
        "areaServed": [
          {
            "@type": "AdministrativeArea",
            "name": "Hérault"
          },
          {
            "@type": "AdministrativeArea",
            "name": "Gard"
          }
        ],
        "description": "Ateliers créatifs itinérants et cours d'arts plastiques à domicile dans l'Hérault et le Gard."
      },
      "offers": [{
        "@type": "Offer",
        "category": "Paid",
        //"price": this.info.basePrice, // TODO : mettre en place le prix
        "priceCurrency": "EUR"
      }]
    };

    // On injecte le script dans le <head> de la page
    const script = this.document.createElement('script');
    script.id = 'seo-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    this.document.head.appendChild(script);
  }
}
