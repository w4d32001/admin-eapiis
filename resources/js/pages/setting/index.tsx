import { Button } from '@/components/ui/button';
import { useSetting } from '@/hooks/useSetting';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Setting } from '@/types/setting';
import { Head } from '@inertiajs/react';
import { Save, X, ZoomIn, FileText, Download } from 'lucide-react';
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

interface PdfItem {
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
        selectedPdf,
        setData, 
        handleSubmit, 
        handleImageChange, 
        handlePdfChange,
        removeImage,
        removePdf,
        formatFileSize,
        handleDrop,
        handleDragOver
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

    const pdfItems: PdfItem[] = [
        { name: 'resolucion', title: 'Resolución del programa' }
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
        e.target.src = '/img/subir-imagen.png';
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

    const handleRemovePdf = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        removePdf();
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
            
            {/* Formulario para subir archivos */}
            <div className="flex flex-col gap-y-4 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Configuraciones de Portadas y Documentos</h1>
                    <p className="text-slate-600">Gestiona las imágenes de portada y documentos del sitio web</p>
                </div>

                <div className="flex flex-col gap-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-y-4">
                            <label htmlFor="setting-type" className="text-sm font-medium text-slate-700">
                                Tipo de configuración
                            </label>
                            <select
                                id="setting-type"
                                value={data.name || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('name', e.target.value)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                            >
                                <option value="" disabled>
                                    Seleccione una opción
                                </option>
                                <optgroup label="Imágenes de portada">
                                    <option value="docentes">Portada docentes</option>
                                    <option value="nosotros">Portada nosotros</option>
                                    <option value="plan">Portada plan de estudio</option>
                                    <option value="historia">Imagen de historia</option>
                                    <option value="malla">Imagen de la malla curricular</option>
                                </optgroup>
                                <optgroup label="Documentos">
                                    <option value="resolucion">Resolución del programa</option>
                                </optgroup>
                            </select>
                            {errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
                        </div>

                        {/* Mostrar campo de imagen solo si el tipo seleccionado es una imagen */}
                        {data.name && ['docentes', 'nosotros', 'plan', 'historia', 'malla'].includes(data.name) && (
                            <div className="flex flex-col gap-y-4">
                                <label className="text-sm font-medium text-slate-700">
                                    Imagen
                                </label>
                                <div 
                                    className="relative"
                                    onDrop={(e) => handleDrop(e, 'image')}
                                    onDragOver={handleDragOver}
                                >
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
                                                {selectedImage ? 'Haz clic para cambiar' : 'Haz clic para subir imagen o arrastra aquí'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Máximo 5MB - JPG, PNG, GIF, WebP
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
                        )}

                        {/* Mostrar campo de PDF solo si el tipo seleccionado es resolucion */}
                        {data.name === 'resolucion' && (
                            <div className="flex flex-col gap-y-4">
                                <label className="text-sm font-medium text-slate-700">
                                    Documento PDF
                                </label>
                                <div 
                                    className="relative"
                                    onDrop={(e) => handleDrop(e, 'pdf')}
                                    onDragOver={handleDragOver}
                                >
                                    <input 
                                        type="file" 
                                        id="pdf-input-label" 
                                        className="hidden" 
                                        accept=".pdf" 
                                        onChange={handlePdfChange} 
                                    />
                                    <label
                                        htmlFor="pdf-input-label"
                                        className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-slate-400 hover:bg-slate-50"
                                    >
                                        {selectedPdf ? (
                                            <div className="text-center">
                                                <FileText className="mx-auto h-12 w-12 text-red-500 mb-2" />
                                                <p className="text-sm font-medium text-slate-700">{selectedPdf.name}</p>
                                                <p className="text-xs text-slate-500">{formatFileSize(selectedPdf.size)}</p>
                                                <p className="text-xs text-slate-500 mt-1">Haz clic para cambiar</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-600">
                                                    Haz clic para subir PDF o arrastra aquí
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Máximo 10MB - Solo archivos PDF
                                                </p>
                                            </div>
                                        )}
                                    </label>

                                    {selectedPdf && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePdf}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600 shadow-sm"
                                            aria-label="Eliminar PDF"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.pdf && <span className="text-sm text-red-600">{errors.pdf}</span>}
                            </div>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={processing || !data.name || (!data.image && !data.pdf)} 
                        className="w-fit"
                    >
                        <Save className="w-4 h-4 mr-2" /> 
                        {processing ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </div>
            </div>

            {/* Sección de Portadas Actuales */}
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
                        const imageSrc: string = imageData?.image || '/img/subir-imagen.png';
                        
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
                                
                                <div className="p-4">
                                    <h3 className="font-medium text-slate-800 text-sm">{item.title}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sección de Documentos Actuales */}
            <div className="px-8 pb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Documentos Actuales</h2>
                    <p className="text-slate-600">Archivos PDF disponibles para descarga</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pdfItems.map((item: PdfItem) => {
                        const pdfData: Setting | undefined = settings.data.find(
                            (s: Setting) => s.name === item.name
                        );
                        
                        return (
                            <div
                                key={item.name}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-red-100 p-4 rounded-full">
                                            <FileText className="h-8 w-8 text-red-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <h3 className="font-medium text-slate-800 mb-2">{item.title}</h3>
                                        
                                        {pdfData?.pdf ? (
                                            <div className="space-y-3">
                                                <p className="text-sm text-green-600 font-medium">✓ Documento disponible</p>
                                                <a
                                                    href={pdfData.pdf}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    <Download size={16} />
                                                    Descargar PDF
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">No hay documento disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal para ver imágenes */}
            {isModalOpen && modalImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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