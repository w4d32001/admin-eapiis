<?php

namespace App\Http\Controllers\Module\Gallery;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gallery\StoreRequest;
use App\Http\Requests\Gallery\UpdateRequest;
use App\Http\Resources\GalleryResource;
use App\Http\Services\CloudinaryService;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function index()
    {
        $query = Gallery::query()->orderBy('created_at', 'desc');

        $galleries = $query->paginate(15);

        return Inertia::render("gallery/index", [
            "galleries" => GalleryResource::collection($galleries),
        ]);
    }

    public function indexApi()
    {
        $query = Gallery::query()->orderBy('created_at', 'desc');

        $galleries = $query->paginate(15);

        return response()->json((["data" => $galleries]));
    }


    public function store(StoreRequest $request)
    {
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();

            if ($request->hasFile('image')) {
                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            }

            Gallery::create($data);

            return redirect()->back()->with('success', 'Galería registrada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error creando galería: ' . $e->getMessage(), [
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al guardar la noticia. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function show(string $id)
    {
        $gallery = Gallery::findOrFail($id);
        return Inertia::render("gallery/show", [
            "gallery" => [
                "data" => $gallery
            ]
        ]);
    }

    public function update(UpdateRequest $request, string $id)
    {
        try {

            $gallery = Gallery::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            if ($request->hasFile('image')) {
                if ($gallery->public_id) {
                    $this->deleteOldImage($gallery->public_id);
                }

                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            } else {
                unset($data['image']);
                unset($data['public_id']);
            }

            $gallery->update($data);

            return redirect()->back()->with('success', 'Galería actualizada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error actualizando galería: ' . $e->getMessage(), [
                'gallery_id' => $id,
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al actualizar la noticia. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function destroy(string $id)
    {
        try {

            $gallery = Gallery::findOrFail($id);

            if ($gallery->public_id) {
                $this->deleteOldImage($gallery->public_id);
            }

            $gallery->delete();


            return redirect()->back()->with('success', 'Galería eliminada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error eliminando galería: ' . $e->getMessage(), [
                'gallery_id' => $id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Error al eliminar la galería. Por favor, intenta nuevamente.'
            ]);
        }
    }
    private function handleImageUpload($file)
    {
        try {
            $result = $this->cloudinaryService->uploadImage(
                $file->getRealPath(),
                'galleries'
            );

            return [
                'image' => $result['url'],
                'public_id' => $result['public_id']
            ];

        } catch (\Exception $e) {
            \Log::error('Error subiendo imagen: ' . $e->getMessage());
            throw new \Exception('Error al subir la imagen. Por favor, intenta nuevamente.');
        }
    }

    private function deleteOldImage($publicId)
    {
        try {
            $this->cloudinaryService->deleteImage($publicId);
        } catch (\Exception $e) {
            \Log::warning('Error eliminando imagen anterior: ' . $e->getMessage(), [
                'public_id' => $publicId
            ]);
        }
    }
}
