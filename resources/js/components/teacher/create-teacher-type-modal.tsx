import { TeacherType } from '@/types/teacher';
import React from 'react'
import { Separator } from '../ui/separator';
import { FormField } from '../form-field';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Save, X } from 'lucide-react';
import { useTeacherTypeModal } from '@/hooks/useTeacherTypeModal';
type CreateTypeTeacherModalProps = {
    open: boolean;
    setOpen: (v: boolean) => void;
    teacherType?: TeacherType | null;
};
export default function CreateTeacherTypeModal({ open, setOpen, teacherType }: CreateTypeTeacherModalProps) {
 const { data, errors, processing, title,  setData, handleClose, handleSubmit } =
        useTeacherTypeModal({ open, setOpen, teacherType });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:min-w-[800px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 flex w-full flex-col gap-y-4">
                    
                    <Separator className='my-4' />
                    <div>
                        <h2>Datos Generales</h2>
                    </div>
                    <div className="flex gap-4 w-full">
                        <FormField label="Nombre" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} className='w-full'/>
                        
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
