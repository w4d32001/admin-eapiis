<?php

namespace App\Http\Services;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;
use Cloudinary\ApiException;

class CloudinaryService
{
    protected $uploadApi;
    protected $adminApi;
  public function __construct()
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => 'dqyxcnusl',
                'api_key'    => '889269391922931',
                'api_secret' => 'yAshj4JZILKou32fUfNbxfUk3jE',
            ],
            'url' => ['secure' => true],
        ]);
        $this->uploadApi = new UploadApi();
        $this->adminApi = new AdminApi();
    }

    public function uploadImage(string $filePath, string $folder = 'default')
    {
        try {
            $response = $this->uploadApi->upload($filePath, [
                'folder' => $folder,
                'use_filename' => true,
                'unique_filename' => true, 
                'transformation' => [
                    'quality' => 'auto:good',
                    'fetch_format' => 'auto'
                ]
            ]);

            return [
                'url' => $response['secure_url'],
                'public_id' => $response['public_id'],
                'width' => $response['width'],
                'height' => $response['height'],
                'format' => $response['format'],
                'bytes' => $response['bytes']
            ];

        }catch (\Exception $e) {
            \Log::error('Cloudinary Upload Error: ' . $e->getMessage());
            throw new \Exception("Error al subir la imagen: " . $e->getMessage());
        }
    }
    public function deleteImage(string $publicId)
    {
        try {
            $response = $this->uploadApi->destroy($publicId);
            
            if ($response['result'] !== 'ok') {
                \Log::warning('Cloudinary delete warning: ' . json_encode($response));
            }

            return $response;

        }catch (\Exception $e) {
            \Log::error('Cloudinary Delete Error: ' . $e->getMessage());
            throw new \Exception("Error al eliminar la imagen: " . $e->getMessage());
        }
    }

    public function uploadMultipleImages(array $files, string $folder = 'default')
    {
        $results = [];
        
        foreach ($files as $file) {
            try {
                $results[] = $this->uploadImage($file, $folder);
            } catch (\Exception $e) {
                \Log::error('Error uploading multiple images: ' . $e->getMessage());
            }
        }

        return $results;
    }

    public function getImageInfo(string $publicId)
    {
        try {
            return $this->adminApi->asset($publicId);
        } catch (\Exception $e) {
            \Log::error('Cloudinary Get Image Info Error: ' . $e->getMessage());
            throw new \Exception("Error al obtener información de la imagen: " . $e->getMessage());
        }
    }

    public function generateTransformationUrl(string $publicId, array $transformations = [])
    {
        try {
            $defaultTransformations = [
                'quality' => 'auto:good',
                'fetch_format' => 'auto'
            ];

            $transformations = array_merge($defaultTransformations, $transformations);

            // Construir URL con transformaciones
            $baseUrl = "https://res.cloudinary.com/" . 'dqyxcnusl' . "/image/upload/";
            $transformationString = $this->buildTransformationString($transformations);
            
            return $baseUrl . $transformationString . '/' . $publicId;

        } catch (\Exception $e) {
            \Log::error('Error generating transformation URL: ' . $e->getMessage());
            throw new \Exception("Error al generar URL de transformación: " . $e->getMessage());
        }
    }

    private function buildTransformationString(array $transformations)
    {
        $parts = [];
        
        foreach ($transformations as $key => $value) {
            if (is_array($value)) {
                $parts[] = $key . '_' . implode(':', $value);
            } else {
                $parts[] = $key . '_' . $value;
            }
        }

        return implode(',', $parts);
    }

    public function ping()
    {
        try {
            return $this->adminApi->ping();
        } catch (\Exception $e) {
            \Log::error('Cloudinary Ping Error: ' . $e->getMessage());
            throw new \Exception("Error de conexión con Cloudinary: " . $e->getMessage());
        }
    }

    public function getUploadPreset(string $presetName)
    {
        try {
            return $this->adminApi->uploadPreset($presetName);
        } catch (\Exception $e) {
            \Log::error('Cloudinary Get Upload Preset Error: ' . $e->getMessage());
            throw new \Exception("Error al obtener preset de subida: " . $e->getMessage());
        }
    }
}