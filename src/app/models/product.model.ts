export interface Product {
    id: number;
    uuid: string;
    name: string;
    description: string;
    technical_specifications: string;
    active: boolean;
    price_usd: string;
    price_bs: string;
    created_at: string;
    brand: number;      // Cambiado de objeto a número
    category: number;   // Cambiado de objeto a número
}
