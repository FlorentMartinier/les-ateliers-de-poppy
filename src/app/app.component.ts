import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { InformationComponent } from './components/information/information.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MenuItem, PromoConfig, SiteConfig, SiteSection } from './models/site.models';
import { SiteService } from './services/site.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, InformationComponent, SidebarComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  config!: SiteConfig;
  menuTree: MenuItem[] = [];
  activeSection!: SiteSection;
  isMenuOpen = false;
  isImageLoading = false;
  isPromoActive = false;

  constructor(
    private siteService: SiteService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.siteService.getSiteConfig().subscribe({
      next: (data) => {
        this.config = data;
        this.buildMenuTree();

        this.handleRouting();
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
          this.isImageLoading = true;
          this.handleRouting();
          this.isPromoActive = this.checkIfPromoActive(this.activeSection.promo);
        });
      }
    });
  }

  onImageLoad() {
    this.isImageLoading = false;
  }

  /**
   * Analyse l'URL capturée par le routeur d'Angular pour charger la bonne section
   */
  handleRouting() {
    const rawPath = this.router.url.replace(/^\//, '').split('?')[0];
    const currentPath = decodeURIComponent(rawPath);

    // Recherche de la section correspondante dans votre JSON
    const matchedSection = this.config.sections.find(s => s.path === currentPath);

    if (matchedSection) {
      this.activeSection = matchedSection;
      const pageTitle = matchedSection.menu_title[matchedSection.menu_title.length - 1];
      this.titleService.setTitle(`${pageTitle} - Ateliers de Poppy`);
      this.metaService.updateTag({ name: 'description', content: `Découvrez nos ateliers : ${pageTitle}` });
    } else if (this.config.sections.length > 0) {
      // Si l'URL n'existe pas dans le JSON ou qu'elle est vide (ex: racine du site "/")
      // On affiche la première page par défaut
      this.activeSection = this.config.sections[0];
      // On met à jour l'URL de manière transparente pour l'utilisateur
      this.router.navigate([this.activeSection.path], { replaceUrl: true });
    }
  }

  buildMenuTree() {
    const tree: MenuItem[] = [];
    this.config.sections.forEach((section, index) => {
      const titles = section.menu_title;
      const sectionPromoActive = this.checkIfPromoActive(section.promo);
      if (titles.length === 1) {
        tree.push({ title: titles[0], sectionIndex: index, isPromo: sectionPromoActive });
      } else if (titles.length === 2) {
        const parentTitle = titles[0];
        const subTitle = titles[1];

        let parent = tree.find(item => item.title === parentTitle);
        if (!parent) {
          parent = { title: parentTitle, subItems: [], isPromo: sectionPromoActive };
          tree.push(parent);
        }
        parent.subItems?.push({ title: subTitle, sectionIndex: index, isPromo: sectionPromoActive });
      }
    });
    this.menuTree = tree;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Au clic dans le menu, on laisse le routeur officiel changer l'URL
   */
  selectSection(index: number) {
    const targetSection = this.config.sections[index];
    this.isMenuOpen = false;

    // On demande au routeur de naviguer vers le path défini. 
    // L'abonnement dans le ngOnInit interceptera ce changement pour mettre à jour l'affichage.
    this.router.navigate([targetSection.path]);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private checkIfPromoActive(promo: PromoConfig | undefined): boolean {
    if (!promo) return false;

    // On récupère la date du jour (sans l'heure pour une comparaison propre)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // On transforme les chaînes du JSON en vrais objets Date
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    // On s'assure que les heures soient à zéro pour la comparaison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // La promo est active si aujourd'hui est entre le début et la fin (inclus)
    return today >= start && today <= end;
  }
}