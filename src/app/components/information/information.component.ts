import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InfoBlock, SafeVideoConfig } from '../../models/site.models';
import { CarrouselComponent } from '../carrousel/carrousel.component';

@Component({
  selector: 'app-information',
  imports: [CommonModule, CarrouselComponent],
  templateUrl: './information.component.html'
})
export class InformationComponent implements OnInit, OnChanges {
  @Input() info!: InfoBlock;

  private sanitizer = inject(DomSanitizer);
  safeVideos: SafeVideoConfig[] = [];
  safeReviewsUrl: SafeResourceUrl | null = null;

  ngOnInit() {
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
}
