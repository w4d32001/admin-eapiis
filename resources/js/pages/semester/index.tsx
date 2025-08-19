import CreateSemesterModal from '@/components/semester/CreateSemesterModal';
import EditSemesterModal from '@/components/semester/EditSemesterModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem } from '@/types';
import { Semester } from '@/types/semester';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Eye, GraduationCap, Plus, Search, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    semesters: {
        data: Semester[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Académico',
        href: '/semesters',
    },
    {
        title: 'Semestres',
        href: '/semesters',
    },
];

export default function Index({ semesters }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { delete: destroy, patch } = useForm();

    const handleDelete = (id: string) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;

            destroy(`/semesters/${id}`, {
                onSuccess: () => showToast.success('Semestre eliminado exitosamente'),
                onError: (error) => console.log(error),
            });
        });
    };

    const handleToggleStatus = (semester: Semester) => {
        const action = semester.is_active ? 'desactivar' : 'activar';

        showToast
            .confirm(`¿Estás seguro que deseas ${action} este semestre?`, `El semestre será ${semester.is_active ? 'desactivado' : 'activado'}.`)
            .then((confirmed) => {
                if (!confirmed) return;

                patch(`/semesters/${semester.id}/toggle-status`, {
                    onSuccess: () => {
                        const status = semester.is_active ? 'desactivado' : 'activado';
                        showToast.success(`Semestre ${status} exitosamente`);
                    },
                    onError: (error) => console.log(error),
                });
            });
    };

    const handleEdit = (semester: Semester) => {
        setSelectedSemester(semester);
        setShowEditModal(true);
    };

    const filteredSemesters = useMemo(() => {
        return semesters.data.filter((semester) => {
            const matchesSearch =
                !debouncedSearchTerm ||
                semester.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                semester.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [semesters.data, debouncedSearchTerm]);

    const availableNumbers = useMemo(() => {
        const existingNumbers = semesters.data.map((s) => s.number);
        return Array.from({ length: 11 }, (_, i) => i + 1).filter((n) => !existingNumbers.includes(n));
    }, [semesters.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semestres" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                <div className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">Semestres Académicos</span>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2" disabled={availableNumbers.length === 0}>
                        <Plus className="h-4 w-4" />
                        Crear Semestre
                    </Button>
                </div>

                {availableNumbers.length === 0 && (
                    <div className="mx-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">Ya has creado todos los semestres disponibles (1-10).</p>
                    </div>
                )}

                <div className="flex flex-col gap-4 px-8 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Buscar semestres..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 px-8 sm:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Total Semestres</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{semesters.data.length}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                        <div className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Activos</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{semesters.data.filter((s) => s.is_active).length}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Disponibles</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-600">{availableNumbers.length}</p>
                    </div>
                </div>

                <div className="px-8">
                    <Table>
                        <TableCaption>
                            {filteredSemesters.length === 0
                                ? 'No hay semestres registrados'
                                : `Total: ${filteredSemesters.length} semestre${filteredSemesters.length !== 1 ? 's' : ''}`}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-48">Semestre</TableHead>
                                <TableHead className="w-20">Imagen</TableHead>
                                <TableHead className="max-w-80 min-w-60">Descripción</TableHead>
                                <TableHead className="min-w-32">Estado</TableHead>
                                <TableHead className="min-w-40">Fecha de creación</TableHead>
                                <TableHead className="min-w-32">Creado por</TableHead>
                                <TableHead className="min-w-24 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSemesters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <GraduationCap className="h-8 w-8" />
                                            <span>No hay semestres que mostrar</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSemesters.map((semester) => (
                                    <TableRow key={semester.id}>
                                        <TableCell className="max-w-60 min-w-48">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                    {semester.number}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="leading-tight font-medium break-words">{semester.formatted_name}</p>
                                                    <p className="mt-1 text-sm text-gray-500">Semestre {semester.number}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-20">
                                            <div className="flex items-center justify-center">
                                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {semester.image ? (
                                                        <img
                                                            src={semester.image}
                                                            alt={`Imagen del ${semester.formatted_name}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <GraduationCap className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-80 min-w-60">
                                            <div className="min-w-0">
                                                {semester.description ? (
                                                    <p
                                                        className="text-sm leading-tight break-words whitespace-normal text-gray-600 line-clamp-4"
                                                        title={semester.description}
                                                    >
                                                        {semester.description}
                                                    </p>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Sin descripción</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-32">
                                            <div className="flex items-center gap-2">
                                                <Switch checked={semester.is_active} onCheckedChange={() => handleToggleStatus(semester)} />
                                                <span
                                                    className={`text-sm font-medium whitespace-nowrap ${
                                                        semester.is_active ? 'text-green-600' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {semester.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-40">
                                            <div className="text-sm">
                                                <div>
                                                    {new Date(semester.updated_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: '2-digit',
                                                    })}
                                                </div>
                                                <div className="text-gray-500">
                                                    {new Date(semester.updated_at).toLocaleTimeString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-40 min-w-32">
                                            <div className="text-sm break-words">{semester.updated_by || 'Usuario'}</div>
                                        </TableCell>
                                        <TableCell className="min-w-24 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(semester)}
                                                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(semester.id.toString())}
                                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash className="h-4 w-4" />
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

            <CreateSemesterModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} availableNumbers={availableNumbers} />

            {selectedSemester && (
                <EditSemesterModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedSemester(null);
                    }}
                    semester={selectedSemester}
                    availableNumbers={[...availableNumbers, selectedSemester.number]}
                />
            )}
        </AppLayout>
    );
}
