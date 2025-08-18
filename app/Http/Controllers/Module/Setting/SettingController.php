<?php

namespace App\Http\Controllers\Module\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreRequest;
use App\Http\Resources\SettingResource;
use App\Http\Services\CloudinaryService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function index()
    {
        $settings = Setting::all();

        return Inertia::render("setting/index", [
            "settings" => SettingResource::collection($settings)
        ]);
    }

    public function indexApi()
    {
        $settings = Setting::all();

        return response()->json((["data" => $settings]));
    }

    public function store(StoreRequest $request)
{
    try {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $imageData = $this->handleImageUpload($request->file('image'));
        $data = array_merge($data, $imageData);

        Setting::updateOrCreate(
            ['name' => $data['name']], 
            $data                   
        );

        return redirect()->back()->with('success', 'Portada registrada exitosamente.');
    } catch (\Exception $e) {
        \Log::error('Error creando galería: ' . $e->getMessage(), [
            'data' => $data ?? null,
            'user_id' => auth()->id()
        ]);

        return redirect()->back()->withErrors([
            'form' => 'Error al guardar la portada. Por favor, intenta nuevamente.',
        ])->withInput();
    }
}



    private function handleImageUpload($file)
    {
        try {
            $result = $this->cloudinaryService->uploadImage(
                $file->getRealPath(),
                'settings'
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
