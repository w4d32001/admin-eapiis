import CreateGalleryModal from '@/components/gallery/CreateGalleryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem } from '@/types';
import { Gallery } from '@/types/gallery';
import { Head, useForm } from '@inertiajs/react';
import { ImageIcon, Plus, Search, Trash } from 'lucide-react';
import React, { useMemo, useState } from 'react'
type Props = {
    galleries: {
        data: Gallery[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Galerías',
        href: '/galleries',
    },
    {
        title: 'Galería',
        href: '/galleries',
    },
];
const GALLERY_TYPES = {
    laboratorios: 'Laboratorios',
    eventos: 'Eventos', 
    alumnos: 'Alumnos',
    vida_universitaria: 'Vida Universitaria'
};
export default function Index({ galleries }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { delete: destroy } = useForm();

    const handleDelete = (id: string) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;

            destroy(`/galleries/${id}`, {
                onSuccess: () => showToast.success('Galería eliminada exitosamente'),
                onError: (error) => console.log(error),
            });
        });
    };

    const filteredGalleries = useMemo(() => {
        return galleries.data.filter((gallery) => {
            const matchesSearch = !debouncedSearchTerm || 
                GALLERY_TYPES[gallery.type as keyof typeof GALLERY_TYPES]
                    ?.toLowerCase()
                    .includes(debouncedSearchTerm.toLowerCase());
            
            const matchesType = !selectedType || gallery.type === selectedType;
            
            return matchesSearch && matchesType;
        });
    }, [galleries.data, debouncedSearchTerm, selectedType]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Galería" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                <div className="flex items-center justify-between px-8 py-4">
                    <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">
                        Galería
                    </span>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Imagen
                    </Button>
                </div>

                <div className="flex flex-col gap-4 px-8 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Buscar por tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        {Object.entries(GALLERY_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabla */}
                <div className="px-8">
                    <Table>
                        <TableCaption>
                            {filteredGalleries.length === 0
                                ? 'No hay imágenes en la galería'
                                : `Total: ${filteredGalleries.length} imagen${filteredGalleries.length !== 1 ? 'es' : ''}`}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Imagen</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Fecha de creación</TableHead>
                                <TableHead>Creado por</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGalleries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <ImageIcon className="h-8 w-8" />
                                            <span>No hay imágenes que mostrar</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGalleries.map((gallery) => (
                                    <TableRow key={gallery.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="relative h-60 w-100 overflow-hidden rounded-lg bg-gray-100">
                                                    {gallery.image ? (
                                                        <img
                                                            src={gallery.image}
                                                            alt="Imagen de galería"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                {GALLERY_TYPES[gallery.type as keyof typeof GALLERY_TYPES] || gallery.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(gallery.updated_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {gallery.updated_by || 'Usuario'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(gallery.id.toString())}
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

            <CreateGalleryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </AppLayout>
    );
}