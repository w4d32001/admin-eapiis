import CreateTeacherModal from '@/components/teacher/create-teacher-modal';
import TooltipIcon from '@/components/tooltip';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem } from '@/types';
import { Teacher, TeacherType } from '@/types/teacher';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import { useState } from 'react';

type Props = {
    teachers: {
        data: Teacher[];
    };
    teacherTypes: TeacherType[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docentes',
        href: '/teacher',
    },
    {
        title: 'Docentes',
        href: '/teacher',
    },
];

export default function Index({ teachers, teacherTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const { delete: destroy } = useForm();
    const openModal = () => {
        setSelectedTeacher(null);
        setIsModalOpen(true);
    };

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };

    const debouncedSearch = useDebounce(searchTerm, 1000);
    const filterTeachers = (teachers: Teacher[], term: string): Teacher[] => {
        const lowerTerm = term.toLowerCase();
        return teachers.filter(
            (teacher) =>
                teacher.name.toLowerCase().includes(lowerTerm) ||
                teacher.teacher_type.name.toLowerCase().includes(lowerTerm) ||
                teacher.email.toLowerCase().includes(lowerTerm),
        );
    };
    const filteredTeachers = filterTeachers(teachers.data, debouncedSearch);
    const handleDelete = (id: number) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;

            destroy(`/teachers/${id}`, {
                onSuccess: () => showToast.success('Docente eliminado exitosamente'),
                onError: (error) => console.log(error),
            });
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de docentes" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                <div className="flex items-center justify-between px-8 py-4">
                    <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">Docentes</span>
                    
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-y-6">
                    <div className="flex w-full items-center justify-between p-4">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="rounded border py-2 pr-8 pl-4 outline-none"
                                placeholder="Buscar docente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute top-2 right-2"></Search>
                        </div>

                        <div className="flex items-center gap-x-2">
                            <Button
                                onClick={openModal}
                                size="lg"
                                type="button"
                                className="flex items-center bg-green-600 transition-colors ease-in hover:bg-green-700"
                            >
                                <Plus></Plus>
                                <span>Agregar nuevo</span>
                            </Button>
                        </div>
                    </div>
                    <div className="w-full border-t px-4">
                        <Table className="">
                            <TableCaption>Una lista de los docentes.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Imagen</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Grado academico</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Telefono</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Actualizado el</TableHead>
                                    <TableHead className="">Actualizado por</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-4 text-center text-gray-500">
                                            No se encontraron docentes que coincidan con la búsqueda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <img src={teacher.image} alt="" className="h-16 w-16 rounded-full object-cover" />
                                            </TableCell>
                                            <TableCell>{teacher.name}</TableCell>
                                            <TableCell>{teacher.academic_degree}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>{teacher.phone}</TableCell>
                                            <TableCell>{teacher.teacher_type.name}</TableCell>
                                            <TableCell>{new Date(teacher.updated_at).toLocaleString()}</TableCell>
                                            <TableCell className="">{teacher.updated_by ? teacher.updated_by : 'Desconocido'}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-x-3">
                                                    <Button
                                                        size="icon"
                                                        type="button"
                                                        className="bg-blue-600 transition-colors ease-in hover:bg-blue-700"
                                                        onClick={() => handleEdit(teacher)}
                                                    >
                                                        <TooltipIcon iconNode={Edit} tooltip="Editar tipo de docente" className="" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        type="button"
                                                        className="bg-red-600 transition-colors ease-in hover:bg-red-700"
                                                        onClick={() => handleDelete(teacher.id)}
                                                    >
                                                        <TooltipIcon iconNode={Trash} tooltip="Eliminar tipo de docente" className="" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <CreateTeacherModal
                open={isModalOpen}
                setOpen={setIsModalOpen}
                teacherTypes={teacherTypes}
                teacher={selectedTeacher}
            ></CreateTeacherModal>
        </AppLayout>
    );
}
