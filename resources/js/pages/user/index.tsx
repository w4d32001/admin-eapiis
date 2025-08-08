import TooltipIcon from '@/components/tooltip';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search, Trash, Users } from 'lucide-react';
import { useState } from 'react';

type Props = {
    users: {
        data: User[];
        current_page?: number;
        last_page?: number;
        total?: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
    },
    {
        title: 'Usuarios',
        href: '/users',
    },
];

export default function Index({ users }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const { delete: destroy } = useForm();

    const debouncedSearch = useDebounce(searchTerm, 1000);

    const filterUsers = (users: User[], term: string): User[] => {
        const lowerTerm = term.toLowerCase();
        return users.filter((user) => user.name.toLowerCase().includes(lowerTerm) || user.email.toLowerCase().includes(lowerTerm));
    };

    const filteredUsers = filterUsers(users.data, debouncedSearch);

    const handleDelete = (id: number) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;
            setIsDeleting(id);

            destroy(`/users/${id}`, {
                onSuccess: () => {
                    setIsDeleting(null);
                    showToast.success('Usuario eliminado exitosamente');
                },
                onError: (errors) => {
                    setIsDeleting(null);

                    if (errors.relations) {
                        let relationMessage = 'No se puede eliminar el usuario porque tiene registros asociados:\n';
                        Object.values(errors.relations).forEach((relation: any) => {
                            relationMessage += `• ${relation.message}\n`;
                        });
                        showToast.error(relationMessage);
                    } else {
                        showToast.error(errors.message);
                    }

                    showToast.error('Error eliminando usuario: ' + errors);
                },
            });
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Sin datos';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-4">
                    <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">Usuarios</span>
                </div>

                {/* Content */}
                <div className="flex w-full flex-col items-center justify-center gap-y-6">
                    {/* Search and Add Button */}
                    <div className="flex w-full items-center justify-between p-4">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="rounded border py-2 pr-10 pl-4 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Buscar usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute top-2.5 right-3 h-4 w-4 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-x-2">
                            <a
                                href={route('register')}
                                className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors ease-in hover:bg-green-700"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar nuevo</span>
                            </a>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full border-t px-4">
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableCaption>
                                    {filteredUsers.length === 0
                                        ? 'No hay usuarios registrados'
                                        : `Total: ${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''}`}
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-48">Nombre</TableHead>
                                        <TableHead className="min-w-60">Correo</TableHead>
                                        <TableHead className="min-w-40">Actualizado el</TableHead>
                                        <TableHead className="min-w-24 text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                                    <Users className="h-8 w-8" />
                                                    <span>
                                                        {searchTerm
                                                            ? 'No se encontraron usuarios que coincidan con la búsqueda.'
                                                            : 'No hay usuarios que mostrar'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user, index) => (
                                            <TableRow key={user.id || index}>
                                                <TableCell className="max-w-60 min-w-48">
                                                    <div className="font-medium break-words first-letter:uppercase">{user.name}</div>
                                                </TableCell>
                                                <TableCell className="max-w-80 min-w-60">
                                                    <div className="text-sm break-words text-gray-600">{user.email}</div>
                                                </TableCell>
                                                <TableCell className="min-w-40">
                                                    <div className="text-sm">{formatDate(user.updated_at)}</div>
                                                </TableCell>
                                                <TableCell className="min-w-24 text-center">
                                                    <div className="flex items-center justify-center gap-x-2">
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={isDeleting === user.id}
                                                        >
                                                            <TooltipIcon
                                                                iconNode={Trash}
                                                                tooltip={isDeleting === user.id ? 'Eliminando...' : 'Eliminar usuario'}
                                                                className={`h-4 w-4 ${isDeleting === user.id ? 'animate-spin' : ''}`}
                                                            />
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

                    {/* Pagination Info */}
                    {users.total && users.total > 0 && (
                        <div className="px-4 py-2 text-sm text-gray-600">
                            Mostrando {filteredUsers.length} de {users.total} usuarios
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
