import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Gallery } from '@/types/gallery';
import { News } from '@/types/news';
import { Semester } from '@/types/semester';
import { Teacher, TeacherType } from '@/types/teacher';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    Eye,
    FileText,
    Filter,
    Image,
    Mail,
    MapPin,
    Newspaper,
    Phone,
    RefreshCw,
    Search,
    Star,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Props = {
    galleries: {
        data: Gallery[];
    };
    news: {
        data: News[];
    };
    semesters: {
        data: Semester[];
    };
    teachers: {
        teachers: {
            data: Teacher[];
        };
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    teacherTypes: TeacherType[];
    stats: {
        total_galleries: number;
        total_news: number;
        total_semesters: number;
        total_teachers: number;
    };
    filters: {
        search?: string;
        teacher_search?: string;
        teacher_type_id?: string;
    };
};

export default function Dashboard({ galleries, news, semesters, teachers, teacherTypes = [], stats = {}, filters = {} }: Props) {
    const [searchNews, setSearchNews] = useState(filters.search || '');
    const [searchTeachers, setSearchTeachers] = useState(filters.teacher_search || '');
    const [selectedTeacherType, setSelectedTeacherType] = useState(filters.teacher_type_id || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (searchType: 'news' | 'teachers') => {
        setIsLoading(true);
        router.get(
            route('dashboard'),
            {
                search: searchType === 'news' ? searchNews : filters.search,
                teacher_search: searchType === 'teachers' ? searchTeachers : filters.teacher_search,
                teacher_type_id: selectedTeacherType,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleNewsSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch('news');
    };

    const handleTeacherFilter = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch('teachers');
    };

    const clearFilters = () => {
        setSearchNews('');
        setSearchTeachers('');
        setSelectedTeacherType('');
        router.get(route('dashboard'));
    };

    // Componente de estadística mejorado
    const StatsCard = ({
        title,
        value,
        icon: Icon,
        bgColor,
        textColor = 'text-white',
        subtitle,
    }: {
        title: string;
        value: number;
        icon: React.ComponentType<any>;
        bgColor: string;
        textColor?: string;
        subtitle?: string;
    }) => (
        <div
            className={`${bgColor} group relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
        >
            <div className="absolute -top-4 -right-4 opacity-10">
                <Icon size={120} />
            </div>
            <div className={`relative ${textColor}`}>
                <div className="mb-2 flex items-center justify-between">
                    <Icon className="text-2xl opacity-90" />
                </div>
                <p className="text-sm font-medium opacity-90">{title}</p>
                <p className="mb-1 text-4xl font-bold">{value.toLocaleString()}</p>
                {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
            </div>
        </div>
    );

    // Componente de métrica rápida con datos reales
    const QuickMetric = ({
        label,
        value,
        icon: Icon,
        color,
    }: {
        label: string;
        value: string | number;
        icon: React.ComponentType<any>;
        color: string;
    }) => (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4">
            <div className={`rounded-lg p-2 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );

    // Componente de noticia mejorado
    const NewsCard = ({ item, index }: { item: News; index: number }) => (
        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-green-500 to-blue-500"></div>
            <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        {new Date(item.updated_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">#{index + 1}</span>
                </div>
                <div className='flex items-center justify-between'>
                    <h4 className="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-green-600">{item.title}</h4>
                    {
                        item.status ? <span className='text-gray-200 text-sm bg-green-700 p-2 rounded-2xl'>Activo</span> : <span className='text-gray-200 text-sm bg-red-700 p-2 rounded-2xl'>Inactivo</span>
                    }
                </div>
                {item.location && (
                    <div className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {item.location}
                    </div>
                )}
            </div>
        </div>
    );

    // Componente de galería mejorado
    const GalleryCard = ({ item }: { item: Gallery }) => (
        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <img src={item.image} className="h-32 object-cover text-3xl text-gray-400 transition-colors group-hover:text-blue-500" />
                <div className="group-hover:bg-opacity-0 absolute inset-0 flex items-center justify-center bg-black/30 transition-all duration-300">
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Eye className="text-xl text-white" />
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h4 className="mb-1 font-semibold text-gray-900">{item.type || 'Galería sin título'}</h4>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {new Date(item.updated_at).toLocaleDateString('es-ES')}
                </p>
            </div>
        </div>
    );

    // Componente de semestre mejorado
    const SemesterCard = ({ item }: { item: Semester }) => (
        <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white transition-transform group-hover:scale-110">
                    <Calendar size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between">
                        <h4 className="font-bold text-gray-900 transition-colors group-hover:text-purple-600">{item.name}</h4>
                        <Award className="text-purple-500 opacity-60" size={16} />
                    </div>
                    {item.description && <p className="mb-3 line-clamp-2 text-sm text-gray-600">{item.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        Actualizado {new Date(item.updated_at).toLocaleDateString('es-ES')}
                    </div>
                </div>
            </div>
        </div>
    );

    // Componente de maestro mejorado
    const TeacherCard = ({ item }: { item: Teacher }) => (
        <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start gap-4">
                <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-lg font-bold text-white transition-transform group-hover:scale-110">
                        {item.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between">
                        <h4 className="font-bold text-gray-900 transition-colors group-hover:text-orange-600">{item.name}</h4>
                        <Star className="text-orange-400" size={16} />
                    </div>
                    <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                        <Mail size={12} />
                        {item.email}
                    </div>
                    {item.phone && (
                        <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                            <Phone size={12} />
                            {item.phone}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                            {item.teacher_type?.name || 'Sin tipo'}
                        </span>
                        <button className="text-orange-500 transition-colors hover:text-orange-700">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Calcular métricas basadas en datos reales
    const totalItems = (stats.total_galleries || 0) + (stats.total_news || 0) + (stats.total_semesters || 0) + (stats.total_teachers || 0);

    console.log(teachers);

    const teachersArray = Array.isArray(teachers?.teachers.data) ? teachers.teachers.data : [];
    const teachersWithType = teachersArray.filter((teacher) => teacher.teacher_type);

    const newsArray = Array.isArray(news?.data) ? news.data : [];
    const recentNews = newsArray.filter((item) => {
        const itemDate = new Date(item.updated_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Panel de Control" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-8">
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-bold text-transparent">
                                    Panel de Control
                                </h1>
                                <p className="mt-1 text-gray-600">Resumen general del sistema educativo</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
                                >
                                    <RefreshCw size={16} />
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <QuickMetric label="Total elementos" value={totalItems} icon={BarChart3} color="bg-green-500" />
                            <QuickMetric label="Noticias recientes" value={recentNews.length} icon={FileText} color="bg-blue-500" />
                            <QuickMetric
                                label="Maestros con tipo"
                                value={`${teachersWithType.length}/${teachersArray.length}`}
                                icon={Users}
                                color="bg-purple-500"
                            />
                            <QuickMetric label="Tipos de maestro" value={teacherTypes.length} icon={BookOpen} color="bg-orange-500" />
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Galerías"
                            value={stats.total_galleries || 0}
                            icon={Image}
                            bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
                            subtitle="Imágenes y multimedia"
                        />
                        <StatsCard
                            title="Total Noticias"
                            value={stats.total_news || 0}
                            icon={Newspaper}
                            bgColor="bg-gradient-to-br from-green-600 to-green-700"
                            subtitle="Artículos publicados"
                        />
                        <StatsCard
                            title="Total Semestres"
                            value={stats.total_semesters || 0}
                            icon={Calendar}
                            bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
                            subtitle="Períodos académicos"
                        />
                        <StatsCard
                            title="Total Maestros"
                            value={stats.total_teachers || 0}
                            icon={User}
                            bgColor="bg-gradient-to-br from-orange-600 to-orange-700"
                            subtitle="Personal docente"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* News Section */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                        <div className="rounded-lg bg-green-500 p-2">
                                            <Newspaper className="text-white" size={24} />
                                        </div>
                                        Noticias Recientes
                                    </h2>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        {newsArray.length} noticias
                                    </span>
                                </div>

                                {/* Search Form */}
                                <form onSubmit={handleNewsSearch}>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Buscar noticias por título, contenido o ubicación..."
                                                value={searchNews}
                                                onChange={(e) => setSearchNews(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6">
                                <div className="max-h-96 space-y-4 overflow-y-auto">
                                    {newsArray.length > 0 ? (
                                        newsArray.map((item, index) => <NewsCard key={item.id || index} item={item} index={index} />)
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Newspaper className="mx-auto mb-4 text-gray-300" size={48} />
                                            <p className="text-lg text-gray-500">No hay noticias disponibles</p>
                                            <p className="mt-2 text-sm text-gray-400">Las noticias aparecerán aquí cuando sean publicadas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Galleries Section */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                        <div className="rounded-lg bg-blue-500 p-2">
                                            <Image className="text-white" size={24} />
                                        </div>
                                        Galerías Recientes
                                    </h2>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                        {galleries?.data?.length || 0} galerías
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto">
                                    {galleries?.data && galleries.data.length > 0 ? (
                                        galleries.data.map((item, index) => <GalleryCard key={item.id || index} item={item} />)
                                    ) : (
                                        <div className="col-span-2 py-12 text-center">
                                            <Image className="mx-auto mb-4 text-gray-300" size={48} />
                                            <p className="text-lg text-gray-500">No hay galerías disponibles</p>
                                            <p className="mt-2 text-sm text-gray-400">Las galerías aparecerán aquí cuando sean creadas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Semesters Section */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                        <div className="rounded-lg bg-purple-500 p-2">
                                            <Calendar className="text-white" size={24} />
                                        </div>
                                        Semestres Académicos
                                    </h2>
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                                        {semesters?.data?.length || 0} semestres
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="max-h-96 space-y-4 overflow-y-auto">
                                    {semesters?.data && semesters.data.length > 0 ? (
                                        semesters.data.map((item, index) => <SemesterCard key={item.id || index} item={item} />)
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                                            <p className="text-lg text-gray-500">No hay semestres disponibles</p>
                                            <p className="mt-2 text-sm text-gray-400">Los semestres aparecerán aquí cuando sean configurados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Teachers Section */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                        <div className="rounded-lg bg-orange-500 p-2">
                                            <User className="text-white" size={24} />
                                        </div>
                                        Personal Docente
                                    </h2>
                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                                        {teachersArray.length} maestros
                                    </span>
                                </div>

                                {/* Teacher Filters */}
                                <form onSubmit={handleTeacherFilter} className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar maestros por nombre, email o teléfono..."
                                            value={searchTeachers}
                                            onChange={(e) => setSearchTeachers(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Filter className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" size={18} />
                                            <select
                                                value={selectedTeacherType}
                                                onChange={(e) => setSelectedTeacherType(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="">Todos los tipos de maestro</option>
                                                {teacherTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Filter size={18} />}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6">
                                <div className="max-h-96 space-y-4 overflow-y-auto">
                                    {teachersArray.length > 0 ? (
                                        teachersArray.map((item, index) => <TeacherCard key={item.id || index} item={item} />)
                                    ) : (
                                        <div className="py-12 text-center">
                                            <User className="mx-auto mb-4 text-gray-300" size={48} />
                                            <p className="text-lg text-gray-500">No hay maestros disponibles</p>
                                            <p className="mt-2 text-sm text-gray-400">Los maestros aparecerán aquí cuando sean registrados</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Info */}
                                {teachers?.meta && teachersArray.length > 0 && (
                                    <div className="mt-6 rounded-xl bg-gray-50 p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Mostrando {teachersArray.length} de {teachers.meta.total} maestros
                                            </span>
                                            <span className="text-gray-500">
                                                Página {teachers.meta.current_page} de {teachers.meta.last_page}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Dashboard actualizado automáticamente • Última actualización: {new Date().toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
