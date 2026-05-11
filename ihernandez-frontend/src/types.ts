export interface City {
    id: number;
    name: string;
    country: string;
}

export interface Activity {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number | string;
    provider_id?: number;
    city_id?: number;
    provider_name?: string;
    duration_minutes?: number;
    max_capacity?: number;
    avgRating?: number | null;
}

export interface Group {
    id: number;
    name: string;
    activities?: Activity[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;    // precio en euros, ej: 19.99
    category: string;
    stock: number;    // unidades disponibles
    imageUrl: string;
    image_url?: string;
    avgRating?: number | null;
    active?: boolean;
}

export interface CartItem {
    product: Activity;
    quantity: number;
    customPlan?: boolean;
}
