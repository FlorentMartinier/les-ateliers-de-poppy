import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, SiteSection } from '../../models/site.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnChanges {
  @Input() isMenuOpen = false;
  @Input() menuTree: MenuItem[] = [];
  @Input() activeSection!: SiteSection;

  @Output() closeMenu = new EventEmitter<void>();
  @Output() sectionSelected = new EventEmitter<number>();

  // Stocke l'état d'ouverture des menus accordéons (Index du menu -> true/false)
  openSubMenus: { [key: number]: boolean } = {};

  ngOnChanges() {
    // À l'ouverture du menu, on s'assure d'ouvrir automatiquement l'accordéon
    // qui contient la section actuellement lue à l'écran
    if (this.isMenuOpen) {
      this.autoExpandActiveMenu();
    }
  }

  toggleSubMenu(index: number, event: Event) {
    event.stopPropagation();
    this.openSubMenus[index] = !this.openSubMenus[index];
  }

  selectSection(index: number) {
    this.sectionSelected.emit(index);
  }

  onClose() {
    this.closeMenu.emit();
  }

  isSectionActive(sectionIndex?: number): boolean {
    if (sectionIndex === undefined || !this.activeSection) return false;

    // On récupère le dernier élément du tableau menu_title de la section active (ex: "Cadre végétal")
    const currentActiveTitle = this.activeSection.menu_title[this.activeSection.menu_title.length - 1];

    // On cherche le libellé de l'élément du menu courant
    const item = this.findMenuItemBySectionIndex(sectionIndex);

    return item?.title === currentActiveTitle;
  }

  private findMenuItemBySectionIndex(index: number): { title: string; sectionIndex: number } | null {
    // Parcourt l'arbre pour trouver l'élément (simple ou sous-menu) qui porte cet index
    for (const menu of this.menuTree) {
      if (menu.sectionIndex === index) {
        return { title: menu.title, sectionIndex: menu.sectionIndex };
      }
      if (menu.subItems) {
        const sub = menu.subItems.find(s => s.sectionIndex === index);
        if (sub) return sub;
      }
    }
    return null;
  }

  private autoExpandActiveMenu() {
    this.menuTree.forEach((menu, index) => {
      if (menu.subItems) {
        const hasActiveChild = menu.subItems.some(sub => {
          // Si l'index de sous-menu correspond au menu_title actif
          return sub.sectionIndex === this.getActiveSectionIndex();
        });
        if (hasActiveChild) {
          this.openSubMenus[index] = true;
        }
      }
    });
  }

  private getActiveSectionIndex(): number {
    if (!this.activeSection || !this.activeSection.menu_title) return -1;
  
    const currentActiveTitle = this.activeSection.menu_title[this.activeSection.menu_title.length - 1];
  
    // En forçant le retour à un tableau d'objets stricts, on élimine le conflit de types
    const allMenuItems = this.menuTree.flatMap((m): { title: string; sectionIndex: number }[] => {
      if (m.subItems) {
        return m.subItems; // C'est déjà un SubMenuItem[] (donc sectionIndex est garanti)
      }
      // Si c'est un item direct, on s'assure de renvoyer une valeur par défaut (0 ou autre) si jamais sectionIndex était absent
      return [{ title: m.title, sectionIndex: m.sectionIndex ?? 0 }];
    });
  
    const activeItem = allMenuItems.find(item => item.title === currentActiveTitle);
  
    return activeItem?.sectionIndex ?? -1;
  }
}