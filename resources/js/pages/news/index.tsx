import CreateNewsModal from '@/components/news/create-news-modal';
import TooltipIcon from '@/components/tooltip';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/user-debounce';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/toast';
import { BreadcrumbItem } from '@/types';
import { News } from '@/types/news';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import { useState } from 'react';

type Props = {
    news: {
        data: News[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Noticias',
        href: '/news',
    },
    {
        title: 'Noticias',
        href: '/news',
    },
];

export default function Index({ news }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const { delete: destroy } = useForm();
    const openModal = () => {
        setSelectedNews(null);
        setIsModalOpen(true);
    };

    const handleEdit = (news: News) => {
        setSelectedNews(news);
        setIsModalOpen(true);
    };

    const debouncedSearch = useDebounce(searchTerm, 1000);
    const filterNews = (news: News[], term: string): News[] => {
        const lowerTerm = term.toLowerCase();
        return news.filter(
            (item) =>
                item.title.toLowerCase().includes(lowerTerm) ||
                item.content.toLowerCase().includes(lowerTerm) ||
                item.location.toLowerCase().includes(lowerTerm),
        );
    };
    const filteredNews = filterNews(news.data, debouncedSearch);
    const handleDelete = (id: number) => {
        showToast.confirm('¿Estás seguro que deseas eliminar?', 'Esta acción no se puede deshacer.').then((confirmed) => {
            if (!confirmed) return;

            destroy(`/news/${id}`, {
                onSuccess: () => showToast.success('Noticia eliminada exitosamente'),
                onError: (error) => console.log(error),
            });
        });
    };

    const handleUpdateStatus = (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'desactivada' : 'activada';
        showToast.confirm(`¿Estás seguro que deseas ${action} la noticia?`, 'Esta acción cambiará el estado.').then((confirmed) => {
            if (!confirmed) return;

            router.patch(
                `/news/${id}/toggle-status`,
                {},
                {
                    onSuccess: () => showToast.success(`Noticia ${action} correctamente`),
                    onError: () => showToast.error('Error al actualizar el estado'),
                },
            );
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de noticias" />
            <div className="flex flex-col gap-y-8 lg:py-8">
                <div className="flex items-center justify-between px-8 py-4">
                    <span className="font-rubik text-2xl font-semibold text-black/90 uppercase">Noticias</span>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-y-6">
                    <div className="flex w-full items-center justify-between p-4">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="rounded border py-2 pr-8 pl-4 outline-none"
                                placeholder="Buscar noticia..."
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
                    <div className="w-full border-t">
                        <div className="overflow-x-auto px-4">
                            <Table className="min-w-full">
                                <TableCaption>Una lista de las noticias.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20 min-w-20">Imagen</TableHead>
                                        <TableHead className="max-w-48 min-w-32">Título</TableHead>
                                        <TableHead className="max-w-80 min-w-40">Contenido</TableHead>
                                        <TableHead className="hidden max-w-32 min-w-24 sm:table-cell">Ubicación</TableHead>
                                        <TableHead className="min-w-32">Fecha</TableHead>
                                        <TableHead className="min-w-28">Estado</TableHead>
                                        <TableHead className="hidden min-w-32 md:table-cell">Actualizado</TableHead>
                                        <TableHead className="hidden min-w-24 lg:table-cell">Por</TableHead>
                                        <TableHead className="min-w-20 text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredNews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-4 text-center text-gray-500">
                                                No se encontraron noticias que coincidan con la búsqueda.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredNews.map((news, index) => (
                                            <TableRow key={news.id ?? `news-${index}`}>
                                                <TableCell className="w-20 min-w-20">
                                                    <img src={news.image} alt="" className="h-12 w-12 rounded-full object-cover sm:h-16 sm:w-16" />
                                                </TableCell>

                                                <TableCell className="max-w-48 min-w-32">
                                                    <div className="text-sm font-medium break-words whitespace-normal sm:text-base first-letter-uppercase">{news.title}</div>
                                                </TableCell>

                                                <TableCell className="max-w-80 min-w-40">
                                                    <div className="text-sm leading-tight break-words whitespace-normal sm:text-base first-letter-uppercase">
                                                        {news.content}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="hidden max-w-32 min-w-24 sm:table-cell">
                                                    <div className="text-sm leading-tight break-words whitespace-normal first-letter-uppercase">{news.location}</div>
                                                </TableCell>
                                                <TableCell className="min-w-32">
                                                    <div className="text-xs sm:text-sm">
                                                        <div className="font-medium">
                                                            {new Date(news.date).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit',
                                                            })}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {new Date(news.date).toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="min-w-28">
                                                    <div
                                                        className="flex items-center gap-1 sm:gap-2"
                                                        onClick={() => handleUpdateStatus(news.id, news.status)}
                                                    >
                                                        <Switch
                                                            checked={news.status}
                                                            onCheckedChange={() => handleUpdateStatus(news.id, news.status)}
                                                            className="scale-75 sm:scale-100"
                                                        />
                                                        <span
                                                            className={`text-xs font-medium whitespace-nowrap sm:text-sm ${news.status ? 'text-green-600' : 'text-gray-500'}`}
                                                        >
                                                            <span className="hidden sm:inline">{news.status ? 'Activo' : 'Inactivo'}</span>
                                                            <span className="sm:hidden">{news.status ? 'On' : 'Off'}</span>
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="hidden min-w-32 md:table-cell">
                                                    <div className="text-sm">
                                                        <div>
                                                            {new Date(news.updated_at).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit',
                                                            })}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {new Date(news.updated_at).toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden min-w-24 lg:table-cell">
                                                    <div className="text-sm break-words">{news.updated_by ? news.updated_by : 'Desconocido'}</div>
                                                </TableCell>

                                                <TableCell className="min-w-20 text-center">
                                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            className="h-8 w-8 bg-blue-600 p-0 transition-colors ease-in hover:bg-blue-700"
                                                            onClick={() => handleEdit(news)}
                                                        >
                                                            <TooltipIcon iconNode={Edit} tooltip="Editar noticia" className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            className="h-8 w-8 bg-red-600 p-0 transition-colors ease-in hover:bg-red-700"
                                                            onClick={() => handleDelete(news.id)}
                                                        >
                                                            <TooltipIcon iconNode={Trash} tooltip="Eliminar noticia" className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-2 px-4 py-2 sm:hidden">
                            {filteredNews.length > 0 &&
                                filteredNews.map((news, index) => (
                                    <div key={`mobile-${news.id ?? index}`} className="border-b pb-2 text-xs text-gray-600 last:border-b-0">
                                        <div>
                                            <strong>Ubicación:</strong> {news.location}
                                        </div>
                                        <div>
                                            <strong>Actualizado:</strong> {new Date(news.updated_at).toLocaleDateString('es-ES')} por{' '}
                                            {news.updated_by || 'Desconocido'}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <CreateNewsModal open={isModalOpen} setOpen={setIsModalOpen} news={selectedNews}></CreateNewsModal>
        </AppLayout>
    );
}
