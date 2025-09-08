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
            $existingSetting = Setting::where('name', $data['name'])->first();

            if ($request->hasFile('image')) {
                if ($existingSetting && $existingSetting->public_id) {
                    $this->deleteOldImage($existingSetting->public_id);
                }

                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            }

            if ($request->hasFile('pdf')) {
                if ($existingSetting && $existingSetting->pdf_public_id) {
                    $this->deleteOldFile($existingSetting->pdf_public_id, 'raw');
                }

                $pdfData = $this->handlePdfUpload($request->file('pdf'));
                $data = array_merge($data, $pdfData);
            }

            Setting::updateOrCreate(
                ['name' => $data['name']],
                $data
            );

            return redirect()->back()->with('success', 'Configuración registrada exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error creando configuración: ' . $e->getMessage(), [
                'data' => $data ?? null,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al guardar la configuración: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    private function handleImageUpload($file)
    {
        try {
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new \Exception('Tipo de imagen no válido. Solo se permiten: JPG, PNG, GIF, WebP.');
            }

            if ($file->getSize() > 5242880) { // 5MB
                throw new \Exception('La imagen no debe superar los 5MB.');
            }

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
            throw new \Exception('Error al subir la imagen: ' . $e->getMessage());
        }
    }

    private function handlePdfUpload($file)
    {
        try {

            if ($file->getMimeType() !== 'application/pdf') {
                throw new \Exception('El archivo debe ser un PDF válido.');
            }

            if ($file->getSize() > 10485760) { // 10MB
                throw new \Exception('El archivo PDF no debe superar los 10MB.');
            }

            \Log::info('Subiendo PDF: ' . $file->getClientOriginalName(), [
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
                'path' => $file->getRealPath()
            ]);

            $result = $this->cloudinaryService->uploadPdf(
                $file->getRealPath(),
                'settings/pdfs'
            );

            \Log::info('PDF subido exitosamente: ' . $result['url']);

            return [
                'pdf' => $result['url'], 
                'pdf_public_id' => $result['public_id'],
                'pdf_size' => $result['bytes'] ?? null,
                'pdf_pages' => $result['pages'] ?? null
            ];

        } catch (\Exception $e) {
            \Log::error('Error subiendo PDF: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName() ?? 'unknown',
                'file_size' => $file->getSize() ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Error al subir el archivo PDF: ' . $e->getMessage());
        }
    }


    private function handleFileUpload($file, $folder = 'settings/files')
    {
        try {
            $result = $this->cloudinaryService->uploadFile(
                $file->getRealPath(),
                $folder,
                [
                    'use_filename' => true,
                    'unique_filename' => true
                ]
            );

            return [
                'file_url' => $result['url'],
                'file_public_id' => $result['public_id'],
                'file_size' => $result['bytes'],
                'file_format' => $result['format']
            ];

        } catch (\Exception $e) {
            \Log::error('Error subiendo archivo: ' . $e->getMessage());
            throw new \Exception('Error al subir el archivo: ' . $e->getMessage());
        }
    }

    private function deleteOldImage($publicId)
    {
        try {
            if ($publicId) {
                $this->cloudinaryService->deleteImage($publicId);
                \Log::info('Imagen anterior eliminada: ' . $publicId);
            }
        } catch (\Exception $e) {
            \Log::warning('Error eliminando imagen anterior: ' . $e->getMessage(), [
                'public_id' => $publicId
            ]);
        }
    }

    private function deleteOldFile($publicId, $resourceType = 'raw')
    {
        try {
            if ($publicId) {
                $this->cloudinaryService->deleteFile($publicId, $resourceType);
                \Log::info('Archivo anterior eliminado: ' . $publicId);
            }
        } catch (\Exception $e) {
            \Log::warning('Error eliminando archivo anterior: ' . $e->getMessage(), [
                'public_id' => $publicId,
                'resource_type' => $resourceType
            ]);
        }
    }

    public function generatePdfPreview($publicId)
    {
        try {
            $previewUrl = $this->cloudinaryService->generatePdfPreviewUrl($publicId, [
                'width' => 300,
                'height' => 400,
                'crop' => 'fill'
            ]);

            return response()->json([
                'success' => true,
                'preview_url' => $previewUrl
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function debug(Request $request)
    {
        if (!app()->environment(['local', 'testing'])) {
            abort(404);
        }

        $setting = Setting::where('name', $request->get('name', 'resolucion'))->first();
        
        return response()->json([
            'setting' => $setting,
            'cloudinary_config' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key') ? 'configured' : 'not configured'
            ]
        ]);
    }
}