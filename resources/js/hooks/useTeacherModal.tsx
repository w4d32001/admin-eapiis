import { showToast } from '@/lib/toast';
import { Teacher } from '@/types/teacher';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
interface UseTeacherModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    teacher?: Teacher | null;
}
export const useTeacherModal = ({ open, setOpen, teacher }: UseTeacherModalProps) => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        academic_degree: '',
        teacher_type_id: '',
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
            if (teacher) {
                setData({
                    name: teacher.name,
                    email: teacher.email,
                    phone: teacher.phone,
                    academic_degree: teacher.academic_degree,
                    teacher_type_id: teacher.teacher_type?.id ?? '',
                    image: null,
                });
                setSelectedImage(teacher.image || null);
            } else {
                clearForm();
            }
        }
    }, [open, teacher, setData, clearForm]);

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

            if (teacher) {
                setOpen(false);
                const confirmed = await showToast.confirm('¿Estás seguro que deseas actualizar?', `Esto actualizará al docente "${teacher.name}".`);

                 if (!confirmed) {
                    setOpen(true); 
                    return;
                }
                post(`/teachers/${teacher.id}`, {
                    ...commonOptions,
                    onError: (errors) => {
                        console.log('Errores:', errors);
                        showToast.error('Revisa los campos e intenta nuevamente.');
                    },
                    onSuccess: () => {
                        clearForm();
                        setOpen(false);
                        showToast.success('Docente actualizado correctamente');
                    },
                });
            } else {
                post('/teachers', {
                    ...commonOptions,
                    onSuccess: () => {
                        clearForm();
                        setOpen(false);
                        showToast.success('Docente registrado correctamente');
                    },
                    onError: (errors) => {
                        console.log(errors);
                        showToast.error('Error al registrar el docente');
                    },
                });
            }
        },
        [teacher, post, clearForm, setOpen],
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
        setSelectedImage(teacher?.image || null);
    }, [setData, teacher?.image]);

    const title = teacher ? `Actualizar docente: ${teacher.name}` : 'Registrar Docente';

    const description = teacher ? 'Actualiza los datos del docente' : 'Completa el formulario para registrar un nuevo docente';

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
