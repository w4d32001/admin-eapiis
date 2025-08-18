import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';
import { useForm } from '@inertiajs/react';
import { GraduationCap, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface CreateSemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableNumbers: number[];
}

const SEMESTER_NAMES = {
    1: 'Primer',
    2: 'Segundo',
    3: 'Tercer',
    4: 'Cuarto',
    5: 'Quinto',
    6: 'Sexto',
    7: 'Séptimo',
    8: 'Octavo',
    9: 'Noveno',
    10: 'Décimo',
    11: 'Electivo',
};

export default function CreateSemesterModal({ isOpen, onClose, availableNumbers }: CreateSemesterModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        number: '',
        description: '',
        image: null as File | null,
        is_active: true,
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

        if (!data.number) {
            showToast.error('Por favor selecciona un número de semestre');
            return;
        }

        if (!data.image) {
            showToast.error('Por favor selecciona una imagen');
            return;
        }

        post('/semesters', {
            onSuccess: () => {
                showToast.success('Semestre creado exitosamente');
                handleClose();
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                if (errors.form) {
                    showToast.error(errors.form);
                } else {
                    showToast.error('Error al crear el semestre');
                }
            },
        });
    };

    const handleClose = () => {
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        onClose();
    };

    const getPreviewName = () => {
        if (data.number) {
            const keys = Object.keys(SEMESTER_NAMES);
            const lastKey = keys[keys.length - 1];
            const semesterName = SEMESTER_NAMES[parseInt(data.number) as keyof typeof SEMESTER_NAMES];

            if (data.number.toString() === lastKey) {
                return semesterName;
            }
            return `${semesterName} Semestre`;
        }
        return 'Selecciona un número';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Semestre</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="number">Número de Semestre *</Label>
                            <select
                                id="number"
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Selecciona un número</option>
                                {availableNumbers
                                    .sort((a, b) => a - b)
                                    .map((number, index, arr) => {
                                        const semesterName = SEMESTER_NAMES[number as keyof typeof SEMESTER_NAMES];
                                        const isLast = index === arr.length - 1;

                                        return (
                                            <option key={number} value={number}>
                                                {number} - {isLast ? semesterName : `${semesterName} Semestre`}
                                            </option>
                                        );
                                    })}
                            </select>
                            {errors.number && <p className="text-sm text-red-600">{errors.number}</p>}
                        </div>

                        {data.number && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Nombre del semestre:</span> {getPreviewName()}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe brevemente el contenido o características de este semestre..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="resize-none"
                                rows={3}
                                maxLength={1000}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Opcional - máximo 1000 caracteres</span>
                                <span>{data.description.length}/1000</span>
                            </div>
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Imagen Representativa *</Label>

                            {imagePreview ? (
                                <div className="relative">
                                    <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
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
                                    className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
                                >
                                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-center text-sm text-gray-600">
                                        <span className="font-medium">Haz clic para subir</span>
                                        <br />o arrastra una imagen aquí
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF hasta 5MB</p>
                                </div>
                            )}

                            <input ref={fileInputRef} type="file" id="image" accept="image/*" onChange={handleImageSelect} className="hidden" />

                            {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                                Semestre activo
                            </Label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !data.number || !data.image}>
                            {processing ? 'Creando...' : 'Crear Semestre'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
