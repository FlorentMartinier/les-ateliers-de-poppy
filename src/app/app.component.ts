import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from "./components/header/header.component";
import { InformationComponent } from './components/information/information.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MenuItem, PromoConfig, SiteConfig, SiteSection } from './models/site.models';
import { SiteService } from './services/site.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, InformationComponent, SidebarComponent, FooterComponent, RouterModule, HeaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  config!: SiteConfig;
  menuTree: MenuItem[] = [];
  activeSection!: SiteSection;
  isMenuOpen = false;
  isImageLoading = false;
  isPromoActive = false;

  // Utilisation de inject() pour plus de modernité en v20
  private platformId = inject(PLATFORM_ID);

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
          if (this.activeSection) {
            this.isPromoActive = this.checkIfPromoActive(this.activeSection.promo);
          }
        });
      }
    });
  }

  handleRouting() {
    // Sécurité pour le build : si la config n'est pas chargée, on s'arrête
    if (!this.config || !this.config.sections) return;

    const rawPath = this.router.url.replace(/^\//, '').split('?')[0];
    const currentPath = decodeURIComponent(rawPath);

    const matchedSection = this.config.sections.find(s => s.path === currentPath);

    if (matchedSection) {
      this.activeSection = matchedSection;
      const pageTitle = matchedSection.menu_title[matchedSection.menu_title.length - 1];
      this.titleService.setTitle(`${pageTitle} - Ateliers de Poppy`);
      this.metaService.updateTag({ name: 'description', content: `Découvrez nos ateliers : ${pageTitle}` });
    } else if (this.config.sections.length > 0) {
      this.activeSection = this.config.sections[0];

      // 💡 CRUCIAL : On n'autorise la redirection QUE dans le vrai navigateur
      // Cela empêche le moteur de Prerender de casser son build à cause d'une redirection
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate([this.activeSection.path], { replaceUrl: true });
      }
    }
  }

  selectSection(index: number) {
    const targetSection = this.config.sections[index];
    this.isMenuOpen = false;
    this.router.navigate([targetSection.path]);

    // 💡 Sécurité : On protège le scrollTo pour le serveur Node.js
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onImageLoad() {
    this.isImageLoading = false;
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