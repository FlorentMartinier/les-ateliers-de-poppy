import { Component, Input } from '@angular/core';

import { SiteConfig } from '../../models/site.models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  @Input() config!: SiteConfig;
}