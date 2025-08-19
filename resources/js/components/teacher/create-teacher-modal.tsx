import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTeacherModal } from '@/hooks/useTeacherModal';
import { Teacher, TeacherType } from '@/types/teacher';
import { Save, X } from 'lucide-react';
import { FormField } from '../form-field';
import { Separator } from '../ui/separator';

type CreateTeacherModalProps = {
    open: boolean;
    setOpen: (v: boolean) => void;
    teacherTypes: TeacherType[];
    teacher?: Teacher | null;
};

export default function CreateTeacherModal({ open, setOpen, teacherTypes, teacher }: CreateTeacherModalProps) {
    const { data, errors, processing, selectedImage, title, description, setData, handleClose, handleSubmit, handleImageChange, removeImage } =
        useTeacherModal({ open, setOpen, teacher });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:min-w-[800px] max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 flex w-full flex-col gap-y-4">
                    <div className="mb-10 flex w-full items-center justify-between gap-y-2">
                        <label htmlFor="image">Imagen del docente</label>
                        <div className="relative max-h-40 w-1/2">
                            <input type="file" id="file-input-label" className="hidden" accept="image/*" onChange={handleImageChange} />

                            <label
                                htmlFor="file-input-label"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-gray-400"
                            >
                                <img src={selectedImage || '/img/subir-imagen.png'} alt="Vista previa" className="h-40 w-auto rounded object-cover" />
                            </label>

                            {selectedImage && selectedImage !== '/img/subir-imagen.png' && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage();
                                    }}
                                    className="absolute top-4 right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        {errors.image && <span className="text-sm text-red-600">{errors.image}</span>}
                    </div>
                    <Separator className='my-4' />
                    <div>
                        <h2>Datos Generales</h2>
                    </div>
                    <div className="flex gap-4 checked ">
                        <FormField label="Nombre completo" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} className='' />

                        <FormField
                            label="Correo"
                            type="email"
                            value={data.email}
                            onChange={(value) => setData('email', value)}
                            error={errors.email}
                        />
                    </div>
                    <div className="flex gap-4">
                        <FormField
                            label="Grado académico"
                            type="text"
                            value={data.academic_degree}
                            onChange={(value) => setData('academic_degree', value)}
                            error={errors.academic_degree}
                        />

                        <FormField
                            label="Teléfono"
                            type="text"
                            value={data.phone}
                            onChange={(value) => setData('phone', value)}
                            error={errors.phone}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4">
                            <label htmlFor="teacher-type">Tipo de docente</label>
                            <select
                                id="teacher-type"
                                className="rounded-lg border px-4 py-2 text-gray-500 outline-none focus:border-blue-700"
                                value={data.teacher_type_id}
                                onChange={(e) => setData('teacher_type_id', e.target.value)}
                            >
                                <option value="" disabled>
                                    Seleccione una opción
                                </option>
                                {teacherTypes.map((types) => (
                                    <option key={types.id} value={types.id}>
                                        {types.name}
                                    </option>
                                ))}
                            </select>
                            {errors.teacher_type_id && <span className="text-sm text-red-600">{errors.teacher_type_id}</span>}
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-y-4">
                        <label htmlFor="">Enlace de CV</label>

                        <FormField
                            label=""
                            type="text"
                            value={data.cv}
                            onChange={(value) => setData('cv', value)}
                            error={errors.cv}
                            className='w-full'
                        />
                            
                            {errors.teacher_type_id && <span className="text-sm text-red-600">{errors.teacher_type_id}</span>}
                    </div>

                    <DialogFooter className="mt-16">
                        <DialogClose asChild>
                            <Button size="lg" type="button" variant="outline">
                                <X /> Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" size="lg" disabled={processing} className="bg-blue-600 transition-colors hover:bg-blue-700">
                            <Save /> {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
