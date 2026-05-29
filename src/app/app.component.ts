import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, SiteConfig, SiteSection } from './models/site.models';
import { InformationComponent } from './components/information/information.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SiteService } from './services/site.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, InformationComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  config!: SiteConfig;
  menuTree: MenuItem[] = [];
  activeSection!: SiteSection;
  isMenuOpen = false;

  constructor(private siteService: SiteService) { }

  ngOnInit() {
    this.siteService.getSiteConfig().subscribe({
      next: (data) => {
        this.config = data;
        this.buildMenuTree();
        if (this.config.sections.length > 0) {
          this.activeSection = this.config.sections[0];
        }
      }
    });
  }

  buildMenuTree() {
    const tree: MenuItem[] = [];
    this.config.sections.forEach((section, index) => {
      const titles = section.menu_title;
      if (titles.length === 1) {
        tree.push({ title: titles[0], sectionIndex: index });
      } else if (titles.length === 2) {
        const parentTitle = titles[0];
        const subTitle = titles[1];

        let parent = tree.find(item => item.title === parentTitle);
        if (!parent) {
          parent = { title: parentTitle, subItems: [] };
          tree.push(parent);
        }
        parent.subItems?.push({ title: subTitle, sectionIndex: index });
      }
    });
    this.menuTree = tree;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectSection(index: number | any) {
    // Si jamais Angular y injecte un objet Event par erreur, on extrait la valeur, sinon on prend le nombre
    const finalIndex = typeof index === 'number' ? index : index?.detail;

    this.activeSection = this.config.sections[finalIndex];
    this.isMenuOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}