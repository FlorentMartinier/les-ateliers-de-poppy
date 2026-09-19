import { SafeResourceUrl } from "@angular/platform-browser";

export interface Footer {
    instagram?: string;
    etsy?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    mail?: string;
    partners?: PartnerConfig[];
}

export interface PartnerConfig {
    title: string;
    url: string;
}

export interface VideoConfig {
    title: string;
    url: string;
}

export interface SafeVideoConfig {
    title: string;
    safeUrl: SafeResourceUrl;
}
export interface InfoBlock {
    title: string;
    category: string;
    images: string[] | null;
    carrousel: string[] | null;
    description: string[] | null;
    price: number | null;
    minimum_person_number: number | null;
    side_images: string[] | null;
    videos?: VideoConfig[];
    googleReviewsUrl?: string;
    has_price_calculation?: boolean;
}

export interface PromoConfig {
    startDate: string;  // Format "YYYY-MM-DD"
    endDate: string;    // Format "YYYY-MM-DD"
    promoPrice: number;
}
export interface SiteSection {
    menu_title: string[];
    banner_image: string;
    informations: InfoBlock[];
    seoTitle?: string;
    seoDescription?: string;
    courseDescription?: string;
    path: string;
    promo?: PromoConfig;
}

export interface SiteConfig {
    title: string;
    shared: SharedConfig;
    footer: Footer;
    sections: SiteSection[];
}

export interface SharedConfig {
    increase: string;
    people: string;
    minimum: string;
    peop: string;
}

// Interface utile pour la gestion du menu burger hiérarchique
export interface SubMenuItem {
    title: string;
    sectionIndex: number;
    isPromo?: boolean;
}

export interface MenuItem {
    title: string;
    isPromo?: boolean;
    sectionIndex?: number; // Présent uniquement si c'est un lien direct (Niveau 1)
    subItems?: SubMenuItem[]; // Présent uniquement s'il y a des sous-menus (Niveau 2)
}

export interface WorkshopPriceItem {
    title: string;
    price: number;
    minimumPersonNumber: number | null;
    category: string;
}