import CreateTeacherTypeModal from '@/components/teacher/create-teacher-type-modal';
import TooltipIcon from '@/components/tooltip';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem } from '@/types';
import { TeacherType } from '@/types/teacher';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

type Props = {
    teacherTypes: {
        data: TeacherType[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docentes',
        href: '/teacher-types',
    },
    {
        title: 'Tipos de docentes',
        href: '/teacher-types',
    },
];

export default function TeacherTypes({ teacherTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacherType, setSselectedTeacherType] = useState<TeacherType | null>(null);
    const { delete: destroy } = useForm();
    const openModal = () => {
        setSselectedTeacherType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (teacherType: TeacherType) => {
        setSselectedTeacherType(teacherType);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;

            destroy(`/teacher-types/${id}`, {
                onSuccess: () => showToast.success('Docente eliminado exitosamente'),
                onError: (error) => console.log(error),
            });
        });
    };
    const debouncedSearch = useDebounce(searchTerm, 1000);
    const filterTeachers = (teachers: TeacherType[], term: string): TeacherType[] => {
        const lowerTerm = term.toLowerCase();
        return teachers.filter(
            (teacher) =>
                teacher.name.toLowerCase().includes(lowerTerm) 
        );
    };
    const filteredTeachers = filterTeachers(teacherTypes.data, debouncedSearch);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de docentes" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                <div className="flex items-center justify-between px-8 py-4">
                    <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">Tipos de docentes</span>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-y-6">
                    <div className="flex w-full items-center justify-end p-4">
                        <Button
                            size="lg"
                            type="button"
                            className="flex items-center bg-green-600 transition-colors ease-in hover:bg-green-700"
                            onClick={openModal}
                        >
                            <TooltipIcon iconNode={Plus} tooltip="Agregarr tipo de docente" className="" />
                            <span>Agregar nuevo</span>
                        </Button>
                    </div>
                    <div className="w-full border-t px-4">
                        <Table className="">
                            <TableCaption>Una lista de los tipos de docentes.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Cod</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Actualizado el</TableHead>
                                    <TableHead className="">Actualizado por</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.map((teacherType, index) => (
                                    <TableRow key={teacherType.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{teacherType.name}</TableCell>
                                        <TableCell>{new Date(teacherType.updated_at).toLocaleString()}</TableCell>
                                        <TableCell className="">{teacherType.updated_by ? teacherType.updated_by : 'Desconocido'}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-x-3">
                                                <Button
                                                    size="icon"
                                                    type="button"
                                                    className="bg-blue-600 transition-colors ease-in hover:bg-blue-700"
                                                    onClick={() => handleEdit(teacherType)}
                                                >
                                                    <TooltipIcon iconNode={Edit} tooltip="Editar tipo de docente" className="" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    type="button"
                                                    className="bg-red-600 transition-colors ease-in hover:bg-red-700"
                                                    onClick={() => handleDelete(teacherType.id)}
                                                >
                                                    <TooltipIcon iconNode={Trash} tooltip="Eliminar tipo de docente" className="" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <CreateTeacherTypeModal open={isModalOpen} setOpen={setIsModalOpen} teacherType={selectedTeacherType}></CreateTeacherTypeModal>
        </AppLayout>
    );
}
