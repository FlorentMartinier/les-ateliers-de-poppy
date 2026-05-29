import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { InfoBlock } from '../../models/site.models';
import { CarrouselComponent } from '../carrousel/carrousel.component';

@Component({
  selector: 'app-information',
  imports: [CommonModule, CarrouselComponent],
  templateUrl: './information.component.html'
})
export class InformationComponent {
  @Input() info!: InfoBlock;

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
