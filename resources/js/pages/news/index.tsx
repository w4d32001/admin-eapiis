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
import { Download, Edit, Plus, Search, Trash } from 'lucide-react';
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
                            <Button size="lg" className="flex items-center bg-purple-600 transition-colors ease-in hover:bg-purple-700">
                                <Download></Download> Descargar
                            </Button>
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
                            <TableCaption>Una lista de las noticias.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Imagen</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Contenido</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Fecha y hora</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Actualizado el</TableHead>
                                    <TableHead className="">Actualizado por</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
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
                                            <TableCell>
                                                <img src={news.image} alt="" className="h-16 w-16 rounded-full object-cover" />
                                            </TableCell>
                                            <TableCell>{news.title}</TableCell>
                                            <TableCell>{news.content}</TableCell>
                                            <TableCell>{news.location}</TableCell>
                                            <TableCell>{new Date(news.date).toLocaleString()}</TableCell>
                                            <TableCell className="px-4" onClick={() => handleUpdateStatus(news.id, news.status)}>
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={news.status} onCheckedChange={() => handleUpdateStatus(news.id, news.status)} />
                                                    <span className={`text-sm font-medium ${news.status ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {news.status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(news.updated_at).toLocaleString()}</TableCell>
                                            <TableCell className="">{news.updated_by ? news.updated_by : 'Desconocido'}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-x-3">
                                                    <Button
                                                        size="icon"
                                                        type="button"
                                                        className="bg-blue-600 transition-colors ease-in hover:bg-blue-700"
                                                        onClick={() => handleEdit(news)}
                                                    >
                                                        <TooltipIcon iconNode={Edit} tooltip="Editar tipo de docente" className="" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        type="button"
                                                        className="bg-red-600 transition-colors ease-in hover:bg-red-700"
                                                        onClick={() => handleDelete(news.id)}
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
            <CreateNewsModal open={isModalOpen} setOpen={setIsModalOpen} news={selectedNews}></CreateNewsModal>
        </AppLayout>
    );
}
