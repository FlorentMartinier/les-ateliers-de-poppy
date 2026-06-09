import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SiteConfig } from '../../models/site.models';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [NgClass],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() config!: SiteConfig;
  @Input() isMenuOpen!: boolean;

  @Output() toggleMenu = new EventEmitter<void>();

  themeService = inject(ThemeService);

  onToggle() {
    this.toggleMenu.emit();
  }
}
