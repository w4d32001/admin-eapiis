export interface Teacher {
    id: number;
    name: string;
    academic_degree: string;
    email: string;
    phone: string;
    image?: string;
    teacher_type: TeacherType;
    updated_at: string;
    updated_by: string;
};

export interface TeacherType {
    id: string;
    name: string;
    updated_at: string;
    updated_by: string;
};