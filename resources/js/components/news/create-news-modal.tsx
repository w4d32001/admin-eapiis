import { useNewsModal } from '@/hooks/useNewsModal';
import { News } from '@/types/news';
import { SaveAll, X } from 'lucide-react';
import DateTimeInput from '../date-time-input';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';

type CreateNewsModal = {
    open: boolean;
    setOpen: (v: boolean) => void;
    news?: News | null;
};

export default function CreateNewsModal({ open, setOpen, news }: CreateNewsModal) {
    const { data, errors, processing, selectedImage, title, description, setData, handleClose, handleSubmit, handleImageChange, removeImage } =
        useNewsModal({ open, setOpen, news });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:min-w-[800px] max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 flex w-full flex-col gap-y-4">
                    <div className="mb-10 flex w-full items-center justify-between gap-y-2">
                        <label htmlFor="image">Imagen de la noticia</label>
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
                    <Separator className="my-4" />
                    <div className="flex justify-between py-4 items-center">
                        <h2>Datos Generales</h2>
                        <DateTimeInput label="Fecha y hora" value={data.date} onChange={(value) => setData('date', value)} error={errors.date} />
                    </div>
                    <div className="flex gap-4">
                        <FormField label="Titulo" value={data.title} onChange={(value) => setData('title', value)} error={errors.title} />

                        <FormField
                            label="Lugar"
                            type="text"
                            value={data.location}
                            onChange={(value) => setData('location', value)}
                            error={errors.location}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex w-full flex-col">
                            <label className="mb-1 font-medium">Contenido</label>
                            <textarea
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                                rows={6}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                            />
                            {errors.content && <span className="text-sm text-red-600">{errors.content}</span>}
                        </div>
                    </div>

                    <DialogFooter className="mt-16">
                        <DialogClose asChild>
                            <Button size="lg" type="button" variant="outline">
                                <X /> Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" size="lg" disabled={processing} className="bg-blue-600 transition-colors hover:bg-blue-700">
                            <SaveAll /> {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
