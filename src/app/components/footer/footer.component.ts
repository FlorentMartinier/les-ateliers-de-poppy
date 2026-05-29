import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteConfig } from '../../models/site.models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  @Input() config!: SiteConfig;
}