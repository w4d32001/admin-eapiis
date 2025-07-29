export interface Gallery {
    id: number;
    type: 'laboratorios' | 'eventos' | 'alumnos' | 'vida_universitaria';
    image: string;
    public_id: string;
    updated_at: string;
    updated_by: string;
}