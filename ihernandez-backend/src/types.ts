// Ciudades
export interface City {
    id: number;
    name: string;
    country: string;
}

// Clientes
export interface Customer {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    full_name: string;
    created_at: string;
    role?: string;
}

// Proveedores
export interface Provider {
    id: number;
    name: string;
    email: string;
    phone: string;
    city_id: number;
}

// Actividades
export interface Activity {
    id: number;
    provider_id: number;
    city_id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    duration_minutes: number;
    max_capacity: number;
    avgRating?: number | null;
}

// Hoteles
export interface Hotel {
    id: number;
    name: string;
    city_id: number;
    price_per_night: number;
    capacity: number;
}

// Grupos (Despedidas de Soltero)
export interface Group {
    id: number;
    name: string;
    organizer_id: number;
    city_id: number;
    event_date: string;
    budget_per_person: number;
}

// Miembros del Grupo
export interface GroupMember {
    id: number;
    group_id: number;
    customer_id: number;
    role: string;
}

// Reservas
export interface Booking {
    id: number;
    group_id: number;
    total_price: number;
    status: string;
    created_at: string;
}

// Ítems de Reserva
export interface BookingItem {
    id: number;
    booking_id: number;
    activity_id: number;
    quantity: number;
    unit_price: number;
}

// Pagos
export interface Payment {
    id: number;
    booking_id: number;
    amount: number;
    method: string;
    status: string;
    paid_at: string;
}

// Reseñas
export interface Review {
    id: number;
    activity_id: number;
    customer_id: number;
    rating: number;
    comment: string;
    created_at: string;
}