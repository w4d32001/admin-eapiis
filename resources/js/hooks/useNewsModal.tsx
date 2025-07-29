import { showToast } from '@/lib/toast';
import { News } from '@/types/news';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface UseNewsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    news?: News | null;
}

export const useNewsModal = ({ open, setOpen, news }: UseNewsModalProps) => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        date: '',
        location: '',
        content: '',
        image: null as File | null,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const clearForm = useCallback(() => {
        reset();
        clearErrors();
        setSelectedImage(null);
    }, [reset, clearErrors]);

    useEffect(() => {
        if (!open) {
            clearErrors();
        }
    }, [open, clearErrors]);

    useEffect(() => {
        if (open) {
            if (news) {
                setData({
                    title: news.title,
                    date: news.date,
                    location: news.location,
                    content: news.content,
                    image: null as File | null,
                });
                setSelectedImage(news.image || null);
            } else {
                clearForm();
            }
        }
    }, [open, news, setData, clearForm]);

    const handleClose = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                clearErrors();
            }
            setOpen(isOpen);
        },
        [clearErrors, setOpen],
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            const commonOptions = {
                forceFormData: true,
                onSuccess: () => {
                    clearForm();
                    setOpen(false);
                },
            };

            if (news) {
                setOpen(false);
                const confirmed = await showToast.confirm(
                    '¿Estás seguro que deseas actualizar?',
                    `Esto actualizará la noticia "${news.title}".`
                );

                if (!confirmed) {
                    setOpen(true);
                    return;
                }

                post(`/news/${news.id}`, {
                    ...commonOptions,
                    onError: (errors) => {
                        console.log('Errores:', errors);
                        showToast.error('Revisa los campos e intenta nuevamente.');
                    },
                    onSuccess: () => {
                        clearForm();
                        setOpen(false);
                        showToast.success('Noticia actualizada correctamente');
                    },
                });
            } else {
                post('/news', {
                    ...commonOptions,
                    onSuccess: () => {
                        clearForm();
                        setOpen(false);
                        showToast.success('Noticia registrada correctamente');
                    },
                    onError: (errors) => {
                        console.log(errors);
                        showToast.error('Error al registrar la noticia');
                    },
                });
            }
        },
        [news, post, clearForm, setOpen],
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
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, JPG, GIF y WEBP.');
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
        setSelectedImage(news?.image || null);
    }, [setData, news?.image]);

    const title = news ? `Actualizar noticia: ${news.title}` : 'Registrar Noticia';
    const description = news ? 'Actualiza los datos de la noticia' : 'Completa el formulario para registrar una nueva noticia';

    return {
        data,
        errors,
        processing,
        selectedImage,
        title,
        description,
        setData,
        handleClose,
        handleSubmit,
        handleImageChange,
        removeImage,
        clearForm,
    };
};
