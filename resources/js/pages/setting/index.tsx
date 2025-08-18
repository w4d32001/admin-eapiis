import { Button } from '@/components/ui/button';
import { useSetting } from '@/hooks/useSetting';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Setting } from '@/types/setting';
import { Head } from '@inertiajs/react';
import { Save, X, ZoomIn } from 'lucide-react';
import React, { useState, useEffect, JSX } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuraciones',
        href: '/settings',
    },
    {
        title: 'Configuraciones',
        href: '/settings',
    },
];

interface Props {
    settings: {
        data: Setting[];
    };
}

interface ImageItem {
    name: string;
    title: string;
}

interface ModalImage {
    image: string;
    title: string;
}

interface ImageErrorEvent extends React.SyntheticEvent<HTMLImageElement, Event> {
    target: HTMLImageElement & EventTarget;
}

export default function Index({ settings }: Props): JSX.Element {
    const { 
        data, 
        errors, 
        processing, 
        selectedImage, 
        setData, 
        handleSubmit, 
        handleImageChange, 
        removeImage 
    } = useSetting();
    
    const [modalImage, setModalImage] = useState<ModalImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const imageItems: ImageItem[] = [
        { name: 'docentes', title: 'Portada docentes' },
        { name: 'nosotros', title: 'Portada nosotros' },
        { name: 'plan', title: 'Portada plan de estudio' },
        { name: 'historia', title: 'Imagen de historia' },
        { name: 'malla', title: 'Imagen de la malla curricular' }
    ];

    const openModal = (image: string, title: string): void => {
        setModalImage({ image, title });
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
        setModalImage(null);
    };

   

    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    const handleImageError = (e: ImageErrorEvent): void => {
        e.target.src = '/img/no-imagen.png';
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        removeImage();
    };

    useEffect((): (() => void) => {
        const keydownHandler = (e: Event): void => {
            if (e instanceof KeyboardEvent) {
                handleGlobalKeyDown(e);
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', keydownHandler);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', keydownHandler);
            document.body.style.overflow = 'unset';
        }

        return (): void => {
            document.removeEventListener('keydown', keydownHandler);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuraciones de Portadas" />
            
            {/* Formulario para subir imágenes */}
            <div className="flex flex-col gap-y-4 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Configuraciones de Portadas</h1>
                    <p className="text-slate-600">Gestiona las imágenes de portada del sitio web</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-y-4">
                            <label htmlFor="teacher-type" className="text-sm font-medium text-slate-700">
                                Tipo de portada
                            </label>
                            <select
                                id="teacher-type"
                                value={data.name || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('name', e.target.value)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                            >
                                <option value="" disabled>
                                    Seleccione una opción
                                </option>
                                <option value="docentes">Portada docentes</option>
                                <option value="nosotros">Portada nosotros</option>
                                <option value="plan">Portada plan de estudio</option>
                                <option value="historia">Imagen de historia</option>
                                <option value="malla">Imagen de la malla curricular</option>
                            </select>
                            {errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
                        </div>

                        <div className="flex flex-col gap-y-4">
                            <label className="text-sm font-medium text-slate-700">
                                Imagen
                            </label>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="file-input-label" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                />
                                <label
                                    htmlFor="file-input-label"
                                    className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <div className="text-center">
                                        <img
                                            src={selectedImage || '/img/subir-imagen.png'}
                                            alt="Vista previa"
                                            className="mx-auto h-32 w-auto rounded object-cover mb-2"
                                        />
                                        <p className="text-sm text-slate-600">
                                            {selectedImage ? 'Haz clic para cambiar' : 'Haz clic para subir imagen'}
                                        </p>
                                    </div>
                                </label>

                                {selectedImage && selectedImage !== '/img/subir-imagen.png' && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600 shadow-sm"
                                        aria-label="Eliminar imagen"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {errors.image && <span className="text-sm text-red-600">{errors.image}</span>}
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={processing || !data.name || !data.image} 
                        className="w-fit"
                    >
                        <Save className="w-4 h-4 mr-2" /> 
                        {processing ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </form>
            </div>

            <div className="px-8 pb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Portadas Actuales</h2>
                    <p className="text-slate-600">Haz clic en cualquier imagen para verla en detalle</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {imageItems.map((item: ImageItem) => {
                        const imageData: Setting | undefined = settings.data.find(
                            (s: Setting) => s.name === item.name
                        );
                        const imageSrc: string = imageData?.image || '/img/no-imagen.png';
                        
                        return (
                            <div
                                key={item.name}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200"
                            >
                                <div className="relative">
                                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={imageSrc}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => openModal(imageSrc, item.title)}
                                            className="opacity-0 group-hover:opacity-100 bg-white text-slate-700 p-3 rounded-full shadow-lg hover:bg-slate-50 transition-all duration-200 transform scale-90 group-hover:scale-100"
                                            aria-label={`Ver ${item.title} en grande`}
                                            type="button"
                                        >
                                            <ZoomIn size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && modalImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  
                    <div
                        className="absolute inset-0 bg-black/10 bg-opacity-80 backdrop-blur-sm"
                        onClick={handleBackdropClick}
                        role="button"
                        tabIndex={0}
                        aria-label="Cerrar modal"
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal();
                            }
                        }}
                    ></div>
                    
                    <div className="relative max-w-7xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {modalImage.title}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                aria-label="Cerrar modal"
                                type="button"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="max-h-[70vh] overflow-auto">
                                <img
                                    src={modalImage.image}
                                    alt={modalImage.title}
                                    className="w-full h-auto object-contain"
                                    style={{ maxHeight: '70vh' }}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t text-center">
                            <p className="text-sm text-slate-600">
                                Presiona <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">ESC</kbd> para cerrar
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}