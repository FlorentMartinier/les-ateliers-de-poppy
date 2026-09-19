import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { InfoBlock, SafeVideoConfig, SharedConfig, SiteSection, WorkshopPriceItem } from '../../models/site.models';
import { CarrouselComponent } from '../carrousel/carrousel.component';
import { PriceCalculatorComponent } from '../price-calculator/price-calculator.component';

@Component({
  selector: 'app-information',
  imports: [CommonModule, CarrouselComponent, PriceCalculatorComponent],
  templateUrl: './information.component.html'
})
export class InformationComponent implements OnInit, OnChanges {
  @Input() section!: SiteSection;
  @Input() allSections!: SiteSection[];
  @Input() info!: InfoBlock;
  @Input() shared!: SharedConfig;

  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  safeVideos: SafeVideoConfig[] = [];
  safeReviewsUrl: SafeResourceUrl | null = null;
  pricedWorkshops: WorkshopPriceItem[] = [];

  ngOnInit() {
    this.updateSEO();
    this.injectCourseSchema();
    this.extractPricedWorkshops();

    if (this.info?.videos && this.info.videos.length > 0) {
      this.safeVideos = this.info.videos.map(video => ({
        title: video.title,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(video.url)
      }));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['info'] || changes['section']) {
      this.updateSEO();
      this.injectCourseSchema();
      this.extractPricedWorkshops();
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
   * Filtre les ateliers de la section pour ne garder que ceux ayant un prix > 0
   */
  private extractPricedWorkshops() {
    if (!this.allSections || this.allSections.length === 0) {
      this.pricedWorkshops = [];
      return;
    }

    // On parcourt chaque section, puis chaque infoBlock contenu dedans
    this.pricedWorkshops = this.allSections
      .flatMap(section => section.informations || [])
      .filter(item => item.price && item.price > 0)
      .map(item => ({
        title: item.title,
        price: item.price!,
        minimumPersonNumber: item.minimum_person_number,
        category: item.category,
      }));
  }

  isListItem(text: string): boolean {
    if (!text) return false;
    return text.trim().startsWith('<tr>');
  }

  isLineBreak(text: string): boolean {
    if (!text) return false;
    return text.trim().startsWith('<hr/>');
  }

  cleanListItem(text: string): string {
    if (!text) return '';
    return text.replace(/<tr>/g, '').replace(/<\/tr>/g, '').trim();
  }

  private updateSEO() {
    const defaultTitle = `${this.section?.menu_title || 'Atelier'} - Poppy in the Sky`;
    this.titleService.setTitle(this.section?.seoTitle || defaultTitle);

    const defaultDesc = `Découvrez l'atelier créatif : ${this.info?.title} proposé par Poppy in the Sky.`;
    this.metaService.updateTag({
      name: 'description',
      content: this.section?.seoDescription || defaultDesc
    });
  }

  private injectCourseSchema() {
    const existingScript = this.document.getElementById('seo-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": this.section?.menu_title,
      "description": this.section?.courseDescription || this.section?.seoDescription,
      "provider": {
        "@type": "LocalBusiness",
        "name": "Poppy in the Sky",
        "areaServed": [
          { "@type": "AdministrativeArea", "name": "Hérault" },
          { "@type": "AdministrativeArea", "name": "Gard" }
        ],
        "description": "Ateliers créatifs itinérants et cours d'arts plastiques à domicile dans l'Hérault et le Gard."
      },
      "offers": [{
        "@type": "Offer",
        "category": "Paid",
        "priceCurrency": "EUR"
      }]
    };

    const script = this.document.createElement('script');
    script.id = 'seo-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    this.document.head.appendChild(script);
  }
}