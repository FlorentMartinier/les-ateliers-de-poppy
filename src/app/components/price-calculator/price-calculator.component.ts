import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { WorkshopPriceItem } from '../../models/site.models';

interface CityCoord {
    name: string;
    lat: number;
    lng: number;
}

@Component({
    selector: 'app-price-calculator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './price-calculator.component.html'
})
export class PriceCalculatorComponent implements OnInit {
    @Input() workshops: WorkshopPriceItem[] = [];

    private http = inject(HttpClient);
    private translate = inject(TranslateService);

    selectedWorkshopTitle: string = '';
    participantsCount: number = 1;
    selectedDate: string = new Date().toISOString().split('T')[0];

    // Propriétés ajoutées pour la gestion de la disponibilité des créneaux
    selectedSlot: 'morning' | 'afternoon' = 'morning';
    isMorningAvailable: boolean = true;
    isAfternoonAvailable: boolean = true;
    isLoadingAvailability: boolean = false;

    selectedCity: string = 'Montpellier';
    calculatedDistanceKm: number = 0;
    isDropdownOpen: boolean = false;

    // Liste globale chargée depuis le fichier JSON
    citiesList: CityCoord[] = [];

    readonly FABREGUES_COORDS: CityCoord = { name: 'Fabrègues', lat: 43.5312, lng: 3.7737 };
    readonly WHATSAPP_PHONE_NUMBER = '33660753438';

    ngOnInit() {
        if (this.workshops && this.workshops.length > 0) {
            this.selectedWorkshopTitle = this.workshops[0].title;
            this.adjustParticipantsToMinimum();
        }

        // Chargement du fichier JSON d'Occitanie
        this.http.get<CityCoord[]>('assets/data/occitanie-cities.json').subscribe({
            next: (data) => {
                this.citiesList = data;
                this.recalculateDistance();
            },
            error: (err) => console.error('Erreur lors du chargement des villes', err)
        });

        // Appel initial pour vérifier la date du jour
        this.checkAvailability();
    }

    t(key: string, params?: Record<string, any>): string {
        return this.translate.instant(key, params);
    }

    get currentWorkshop(): WorkshopPriceItem | undefined {
        return this.workshops.find(w => w.title === this.selectedWorkshopTitle);
    }

    get isWeekend(): boolean {
        if (!this.selectedDate) return false;
        const date = new Date(this.selectedDate);
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    onDateChange() {
        this.checkAvailability();
    }

    /**
     * Interroge la Netlify Function pour récupérer la disponibilité des créneaux
     */
    checkAvailability() {
        if (!this.selectedDate) return;

        this.isLoadingAvailability = true;

        this.http
            .get<{ morningAvailable: boolean; afternoonAvailable: boolean }>(
                `/.netlify/functions/check-availability?date=${this.selectedDate}`
            )
            .subscribe({
                next: (res) => {
                    this.isMorningAvailable = res.morningAvailable;
                    this.isAfternoonAvailable = res.afternoonAvailable;
                    this.isLoadingAvailability = false;

                    // Auto-sélectionne le premier créneau disponible si celui sélectionné est occupé
                    if (!this.isMorningAvailable && this.isAfternoonAvailable) {
                        this.selectedSlot = 'afternoon';
                    } else if (this.isMorningAvailable) {
                        this.selectedSlot = 'morning';
                    }
                },
                error: (err) => {
                    console.error('Erreur lors du contrôle des disponibilités', err);
                    this.isLoadingAvailability = false;
                }
            });
    }

    selectSlot(slot: 'morning' | 'afternoon') {
        this.selectedSlot = slot;
    }

    onWorkshopChange() {
        if (this.currentWorkshop?.minimumPersonNumber && this.participantsCount < this.currentWorkshop.minimumPersonNumber) {
            this.participantsCount = this.currentWorkshop.minimumPersonNumber;
        }
    }

    private adjustParticipantsToMinimum() {
        if (this.currentWorkshop?.minimumPersonNumber) {
            this.participantsCount = this.currentWorkshop.minimumPersonNumber;
        }
    }

    get isMinimumNotReached(): boolean {
        if (!this.currentWorkshop?.minimumPersonNumber) return false;
        return this.participantsCount < this.currentWorkshop.minimumPersonNumber;
    }

    get isNoSlotAvailable(): boolean {
        return !this.isMorningAvailable && !this.isAfternoonAvailable;
    }

    get workshopSubtotal(): number {
        const unitPrice = this.currentWorkshop?.price || 0;
        const base = unitPrice * (this.participantsCount || 0);
        return this.isWeekend ? base * 1.1 : base;
    }

    onInputFocus() {
        this.isDropdownOpen = true;
    }

    onInputBlur() {
        setTimeout(() => {
            this.isDropdownOpen = false;
        }, 200);
    }

    selectCity(city: CityCoord) {
        this.selectedCity = city.name;
        this.isDropdownOpen = false;
        this.recalculateDistance();
    }

    recalculateDistance() {
        if (!this.selectedCity || this.citiesList.length === 0) {
            this.calculatedDistanceKm = 0;
            return;
        }

        const searchNormalized = this.normalizeString(this.selectedCity.trim());

        const city = this.citiesList.find(c => {
            return this.normalizeString(c.name) === searchNormalized;
        });

        if (city) {
            this.calculatedDistanceKm = Math.round(this.haversineDistance(this.FABREGUES_COORDS, city));
        } else {
            this.calculatedDistanceKm = 0;
        }
    }

    get travelFee(): number {
        const baseFee = this.isWeekend ? 20 : 15;
        if (this.calculatedDistanceKm <= 30) {
            return baseFee;
        }
        const extraKm = this.calculatedDistanceKm - 30;
        return baseFee + extraKm;
    }

    get extraKmCount(): number {
        return Math.max(0, this.calculatedDistanceKm - 30);
    }

    get total(): number {
        return this.workshopSubtotal + this.travelFee;
    }

    get filteredCities(): CityCoord[] {
        if (!this.selectedCity || this.selectedCity.trim().length < 2) {
            return [];
        }

        const search = this.normalizeString(this.selectedCity.trim());

        return this.citiesList
            .filter(c => this.normalizeString(c.name).includes(search))
            .slice(0, 8);
    }

    private haversineDistance(coords1: CityCoord, coords2: CityCoord): number {
        const R = 6371;
        const dLat = this.toRadians(coords2.lat - coords1.lat);
        const dLng = this.toRadians(coords2.lng - coords1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coords1.lat)) * Math.cos(this.toRadians(coords2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    sendDevisWhatsApp() {
        if (this.isMinimumNotReached || this.isNoSlotAvailable || !this.currentWorkshop) return;

        const dayType = this.translate.instant(
            this.isWeekend ? 'PRICE_CALCULATOR.DAY_WEEKEND' : 'PRICE_CALCULATOR.DAY_WEEKDAY'
        );

        const slotLabel = this.selectedSlot === 'morning' ? 'PRICE_CALCULATOR.MORNING_AVAILABILITY' : 'PRICE_CALCULATOR.AFETERNOON_AVAILABILITY';

        const message = this.translate.instant('PRICE_CALCULATOR.WHATSAPP_MESSAGE', {
            workshopName: this.currentWorkshop.title,
            date: `${this.selectedDate} (${slotLabel})`,
            dayType: dayType,
            count: this.participantsCount,
            city: this.selectedCity,
            distance: this.calculatedDistanceKm,
            total: this.total.toFixed(2)
        });

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    }

    private normalizeString(str: string): string {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
}