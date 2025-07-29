import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';
import { Semester } from '@/types/semester';
import { useForm } from '@inertiajs/react';
import { Upload, X, GraduationCap } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface EditSemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
    semester: Semester;
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
    10: 'Décimo'
};

export default function EditSemesterModal({ isOpen, onClose, semester, availableNumbers }: EditSemesterModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        number: semester.number.toString(),
        description: semester.description || '',
        image: null as File | null,
        is_active: semester.is_active,
        _method: 'POST',
    });

    useEffect(() => {
        if (isOpen) {
            setData(prev => ({
                ...prev,
                number: semester.number.toString(),
                description: semester.description || '',
                is_active: semester.is_active,
                _method: 'POST',
            }));
            setImagePreview(semester.image || null);
            setSelectedImage(null);
        }
    }, [isOpen, semester, setData]);

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
        setImagePreview(semester.image || null);
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

        post(`/semesters/${semester.id}`, {
            onSuccess: () => {
                showToast.success('Semestre actualizado exitosamente');
                handleClose();
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                if (errors.form) {
                    showToast.error(errors.form);
                } else {
                    showToast.error('Error al actualizar el semestre');
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
            const semesterName = SEMESTER_NAMES[parseInt(data.number) as keyof typeof SEMESTER_NAMES];
            return `${semesterName} Semestre`;
        }
        return 'Selecciona un número';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            />
            
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Editar Semestre
                            </h3>
                            <p className="text-sm text-gray-600">{semester.formatted_name}</p>
                        </div>
                    </div>
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
                        {/* Selector de número de semestre */}
                        <div className="space-y-2">
                            <Label htmlFor="number">Número de Semestre *</Label>
                            <select
                                id="number"
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                {availableNumbers.sort((a, b) => a - b).map((number) => (
                                    <option key={number} value={number}>
                                        {number} - {SEMESTER_NAMES[number as keyof typeof SEMESTER_NAMES]} Semestre
                                    </option>
                                ))}
                            </select>
                            {errors.number && (
                                <p className="text-sm text-red-600">{errors.number}</p>
                            )}
                        </div>

                        {/* Preview del nombre */}
                        {data.number && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Nombre del semestre:</span> {getPreviewName()}
                                </p>
                            </div>
                        )}

                        {/* Descripción */}
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
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Selector de imagen */}
                        <div className="space-y-2">
                            <Label htmlFor="image">
                                Imagen Representativa 
                                {selectedImage && <span className="text-sm text-gray-500 ml-1">(Nueva imagen seleccionada)</span>}
                            </Label>
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Cambiar
                                            </Button>
                                            {selectedImage && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    className="flex items-center gap-2"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancelar
                                                </Button>
                                            )}
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

                        {/* Estado activo */}
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

                    {/* Botones */}
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
                            disabled={processing || !data.number}
                        >
                            {processing ? 'Actualizando...' : 'Actualizar Semestre'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}