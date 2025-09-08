export interface Setting {
    id: number;
    name: 'nosotros' | 'plan' | 'docentes' | 'historia' | 'malla';
    image: string;
    pdf: string;
    public_id: string;
    updated_at: string;
    updated_by: string;
}