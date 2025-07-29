import { showToast } from '@/lib/toast';
import { TeacherType } from '@/types/teacher';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';

interface UseTeacherModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    teacherType?: TeacherType | null;
}

export const useTeacherTypeModal = ({ open, setOpen, teacherType }: UseTeacherModalProps) => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    const clearForm = useCallback(() => {
        reset();
        clearErrors();
    }, [reset, clearErrors]);

    useEffect(() => {
        if (!open) {
            clearErrors();
        }
    }, [open, clearErrors]);

    useEffect(() => {
        if (open) {
            if (teacherType) {
                setData({
                    name: teacherType.name,
                });
            } else {
                clearForm();
            }
        }
    }, [open, teacherType, setData, clearForm]);

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

            if (teacherType) {
                setOpen(false);
                const confirmed = await showToast.confirm('¿Estás seguro que deseas actualizar?', `Esto actualizará al tipo de docente "${teacherType.name}".`);

                 if (!confirmed) {
                    setOpen(true); 
                    return;
                }
                post(`/teacher-types/${teacherType.id}`, {
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
                post('/teacher-types', {
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
        [teacherType, post, clearForm, setOpen],
    );



    const title = teacherType ? `Actualizar el docente: ${teacherType.name}` : 'Registrar al tipo de docente';


    return {
        data,
        errors,
        processing,
        title,
        setData,
        handleClose,
        handleSubmit,
        clearForm,
    };
};
