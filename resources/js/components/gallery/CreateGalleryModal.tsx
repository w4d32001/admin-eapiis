import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { useForm } from '@inertiajs/react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface CreateGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GALLERY_TYPES = {
    laboratorios: 'Laboratorios',
    eventos: 'Eventos',
    alumnos: 'Alumnos',
    vida_universitaria: 'Vida Universitaria'
};

export default function CreateGalleryModal({ isOpen, onClose }: CreateGalleryModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        image: null as File | null,
    });

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast.error('Por favor selecciona una imagen válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast.error('La imagen debe ser menor a 5MB');
                return;
            }

            setSelectedImage(file);
            setData('image', file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setData('image', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.type) {
            showToast.error('Por favor selecciona un tipo de galería');
            return;
        }

        if (!data.image) {
            showToast.error('Por favor selecciona una imagen');
            return;
        }

        post('/galleries', {
            onSuccess: () => {
                showToast.success('Imagen agregada exitosamente');
                handleClose();
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                showToast.error('Error al guardar la imagen');
            },
        });
    };

    const handleClose = () => {
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            />
            
            <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Agregar Imagen a Galería
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Galería *</Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="">Selecciona un tipo</option>
                                {Object.entries(GALLERY_TYPES).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Imagen *</Label>
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleRemoveImage}
                                                className="flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Remover
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100"
                                >
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 text-center">
                                        <span className="font-medium">Haz clic para subir</span>
                                        <br />
                                        o arrastra una imagen aquí
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG, GIF hasta 5MB
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            
                            {errors.image && (
                                <p className="text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.type || !data.image}
                        >
                            {processing ? 'Guardando...' : 'Guardar Imagen'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}