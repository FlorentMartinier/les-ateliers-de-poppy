import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-carrousel',
  imports: [CommonModule],
  templateUrl: './carrousel.component.html',
})
export class CarrouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() images: string[] = [];
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  extendedImages: string[] = [];
  zoomedImage: string | null = null;
  animationId: any;
  scrollSpeed = 1; // Vitesse de croisière (pixels par frame)
  isPaused = false;

  ngOnInit() {
    if (this.images && this.images.length > 0) {
      // On duplique de manière importante pour assurer la continuité infinie fluide
      this.extendedImages = [...this.images, ...this.images, ...this.images, ...this.images, ...this.images];
    }
  }

  ngAfterViewInit() {
    // Le setTimeout permet d'attendre que le DOM et Tailwind appliquent les largeurs réelles des blocs
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      // On commence au milieu du lot d'images pour pouvoir scroller à gauche comme à droite immédiatement
      container.scrollLeft = container.scrollWidth / 3;
      this.startContainerAnimation();
    }, 200);
  }

  ngOnDestroy() {
    this.pauseContainerAnimation();
  }

  startContainerAnimation() {
    this.isPaused = false; 

    const animate = () => {
      if (!this.scrollContainer || this.isPaused) return;
      const container = this.scrollContainer.nativeElement;

      container.scrollLeft += this.scrollSpeed;

      // Boucle infinie invisible
      if (container.scrollLeft >= (container.scrollWidth - container.clientWidth * 1.5)) {
        container.scrollLeft = container.scrollWidth / 3;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  pauseContainerAnimation() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  scrollLeft() {
    this.pauseContainerAnimation();
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = container.clientWidth / 2;

    // Si on arrive au bout à gauche, on recale à droite de façon transparente
    if (container.scrollLeft <= 10) {
      container.scrollLeft = container.scrollWidth / 2;
    }

    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

    // On relance l'animation après la fin du scroll fluide
    setTimeout(() => this.startContainerAnimation(), 400);
  }

  scrollRight() {
    this.pauseContainerAnimation();
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = container.clientWidth / 2;

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    setTimeout(() => this.startContainerAnimation(), 400);
  }

  openZoom(img: string) {
    this.zoomedImage = img;
    this.pauseContainerAnimation();
  }

  closeZoom() {
    this.zoomedImage = null;
    this.isPaused = false;
    this.startContainerAnimation();
  }
}
