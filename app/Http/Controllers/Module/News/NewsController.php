<?php

namespace App\Http\Controllers\Module\News;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreRequest;
use App\Http\Requests\News\UpdateRequest;
use App\Http\Resources\NewsResource;
use App\Http\Services\CloudinaryService;
use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;
use function Termwind\render;

class NewsController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function index(Request $request)
    {
        $query = News::query()->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        $news = $query->paginate(15);

        return Inertia::render("news/index", [
            "news" => NewsResource::collection($news),
            "filters" => $request->only(['search']),
        ]);
    }

    public function indexApi(Request $request)
    {
        $query = News::query()->where('status', true)->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        $news = $query->paginate(15);

        return response()->json(["data" => $news]);
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

            News::create($data);

            return redirect()->back()->with('success', 'Noticia registrada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error creando noticia: ' . $e->getMessage(), [
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
        $news = News::findOrFail($id);
        return Inertia::render("news/show", [
            "news" => [
                "data" => $news
            ]
        ]);
    }

    public function update(UpdateRequest $request, string $id)
    {
        try {

            $news = News::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            if ($request->hasFile('image')) {
                if ($news->public_id) {
                    $this->deleteOldImage($news->public_id);
                }

                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            } else {
                unset($data['image']);
                unset($data['public_id']);
            }

            $news->update($data);

            return redirect()->back()->with('success', 'Noticia actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error actualizando noticia: ' . $e->getMessage(), [
                'news_id' => $id,
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

            $news = News::findOrFail($id);

            if ($news->public_id) {
                $this->deleteOldImage($news->public_id);
            }

            $news->delete();


            return redirect()->back()->with('success', 'Noticia eliminada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error eliminando noticia: ' . $e->getMessage(), [
                'news_id' => $id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Error al eliminar la noticia. Por favor, intenta nuevamente.'
            ]);
        }
    }

    public function toggleStatus(string $id)
    {
        try {

            $news = News::findOrFail($id);
            $news->status = !$news->status;
            $news->updated_by = auth()->id();
            $news->save();

            return redirect()->back()->with('success', 'Estado de la noticia actualizado correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error desactivando noticia: ' . $e->getMessage(), [
                'news_id' => $id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Error al desactivar la noticia. Por favor, intenta nuevamente.'
            ]);
        }
    }

    private function handleImageUpload($file)
    {
        try {
            $result = $this->cloudinaryService->uploadImage(
                $file->getRealPath(),
                'news'
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