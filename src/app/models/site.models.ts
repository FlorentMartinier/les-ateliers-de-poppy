export interface Footer {
    instagram?: string;
    mail?: string;
}

export interface InfoBlock {
    title: string;
    images: string[] | null;
    carrousel: string[] | null;
    description: string[] | null;
    side_images: string[] | null;
}

export interface SiteSection {
    menu_title: string[];
    banner_image: string;
    informations: InfoBlock[];
}

export interface SiteConfig {
    title: string;
    footer: Footer;
    sections: SiteSection[];
}

// Interface utile pour la gestion du menu burger hiérarchique
export interface SubMenuItem {
    title: string;
    sectionIndex: number;
  }
  
  export interface MenuItem {
    title: string;
    sectionIndex?: number; // Présent uniquement si c'est un lien direct (Niveau 1)
    subItems?: SubMenuItem[]; // Présent uniquement s'il y a des sous-menus (Niveau 2)
  }