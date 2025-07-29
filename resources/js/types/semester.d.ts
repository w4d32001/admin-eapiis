export interface Semester {
    id: string;
    name: string;
    number: number;
    formatted_name: string;
    image: string;
    description?: string;
    is_active: boolean;
    updated_at: string;
    updated_by: string;
}
