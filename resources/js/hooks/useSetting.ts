import { showToast } from '@/lib/toast';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export const useSetting = () => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image: null as File | null,
        pdf: null as File | null,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<{
        name: string;
        size: number;
        type: string;
    } | null>(null);

    const clearForm = useCallback(() => {
        reset();
        clearErrors();
        setSelectedImage(null);
        setSelectedPdf(null);
    }, [reset, clearErrors]);

    useEffect(() => {
        clearErrors();
    }, [clearErrors]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            const commonOptions = {
                forceFormData: true,
                onSuccess: () => {
                    clearForm();
                },
            };

            post('/settings', {
                ...commonOptions,
                onSuccess: () => {
                    clearForm();
                    showToast.success('Configuración registrada correctamente');
                },
                onError: (errors) => {
                    console.log(errors);
                    showToast.error('Error al registrar la configuración');
                },
            });
        },
        [post, clearForm],
    );

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validaciones para imagen
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showToast.error('La imagen es demasiado grande. Máximo 5MB.');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showToast.error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, JPG, GIF y WebP.');
                return;
            }

            setData('image', file);

            // Crear vista previa
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        },
        [setData],
    );

    const handlePdfChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validaciones para PDF
            const maxSize = 20 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                showToast.error('El archivo PDF es demasiado grande. Máximo 20MB.');
                return;
            }

            if (file.type !== 'application/pdf') {
                showToast.error('Tipo de archivo no válido. Solo se permiten archivos PDF.');
                return;
            }

            setData('pdf', file);

            // Guardar información del PDF para mostrar
            setSelectedPdf({
                name: file.name,
                size: file.size,
                type: file.type,
            });
        },
        [setData],
    );

    const removeImage = useCallback(() => {
        setData('image', null);
        setSelectedImage(null);
    }, [setData]);

    const removePdf = useCallback(() => {
        setData('pdf', null);
        setSelectedPdf(null);
    }, [setData]);

    // Función helper para formatear el tamaño de archivo
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Función para validar archivos antes de seleccionar
    const validateFile = useCallback((file: File, type: 'image' | 'pdf'): boolean => {
        if (type === 'image') {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            
            if (file.size > maxSize) {
                showToast.error('La imagen es demasiado grande. Máximo 5MB.');
                return false;
            }
            
            if (!allowedTypes.includes(file.type)) {
                showToast.error('Tipo de archivo no válido para imagen.');
                return false;
            }
        } else if (type === 'pdf') {
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (file.size > maxSize) {
                showToast.error('El archivo PDF es demasiado grande. Máximo 10MB.');
                return false;
            }
            
            if (file.type !== 'application/pdf') {
                showToast.error('Tipo de archivo no válido. Solo se permiten archivos PDF.');
                return false;
            }
        }
        
        return true;
    }, []);

    // Función para manejar drag & drop
    const handleDrop = useCallback(
        (e: React.DragEvent, type: 'image' | 'pdf') => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            const file = files[0];

            if (!file) return;

            if (!validateFile(file, type)) return;

            if (type === 'image') {
                handleImageChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
            } else {
                handlePdfChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
            }
        },
        [handleImageChange, handlePdfChange, validateFile],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    return {
        // Form data
        data,
        errors,
        processing,
        
        // File states
        selectedImage,
        selectedPdf,
        
        // Form methods
        setData,
        handleSubmit,
        clearForm,
        
        // File handlers
        handleImageChange,
        handlePdfChange,
        removeImage,
        removePdf,
        
        // Drag & Drop
        handleDrop,
        handleDragOver,
        
        // Utilities
        formatFileSize,
        validateFile,
        
        // File info getters
        getImageInfo: () => data.image ? {
            name: data.image.name,
            size: formatFileSize(data.image.size),
            type: data.image.type,
        } : null,
        
        getPdfInfo: () => data.pdf ? {
            name: data.pdf.name,
            size: formatFileSize(data.pdf.size),
            type: data.pdf.type,
        } : null,
        
        // Validation helpers
        hasImage: () => data.image !== null,
        hasPdf: () => data.pdf !== null,
        hasFiles: () => data.image !== null || data.pdf !== null,
    };
};