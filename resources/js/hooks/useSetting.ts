import { showToast } from '@/lib/toast';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export const useSetting = () => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image: null as File | null,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const clearForm = useCallback(() => {
        reset();
        clearErrors();
        setSelectedImage(null);
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
                        showToast.success('Portada registrada correctamente');
                    },
                    onError: (errors) => {
                        console.log(errors);
                        showToast.error('Error al registrar la portada');
                    },
                });
            
        },
        [post, clearForm],
    );

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('El archivo es demasiado grande. Máximo 2MB.');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, JPG y GIF.');
                return;
            }

            setData('image', file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        },
        [setData],
    );

    const removeImage = useCallback(() => {
        setData('image', null);
    }, [setData]);

    return {
        data,
        errors,
        processing,
        selectedImage,
        setData,
        handleSubmit,
        handleImageChange,
        removeImage,
        clearForm,
    };
};
