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

    /**
     * Sube un archivo PDF a Cloudinary
     *
     * @param string $filePath Ruta del archivo PDF
     * @param string $folder Carpeta destino en Cloudinary
     * @return array Información del archivo subido
     * @throws \Exception
     */
     public function uploadPdf(string $filePath, string $folder = 'pdfs')
    {
        try {
            $response = $this->uploadApi->upload($filePath, [
                'folder' => $folder,
                'resource_type' => 'raw', // Para archivos PDF
                'use_filename' => true,
                'unique_filename' => true
            ]);

            // Log de la respuesta para debug
            //\Log::info('Cloudinary PDF upload response:'.$response);

            return [
                'url' => $response['secure_url'],
                'public_id' => $response['public_id'],
                'format' => $response['format'] ?? 'pdf', 
                'bytes' => $response['bytes'] ?? 0,
                'pages' => $response['pages'] ?? null, 
                'created_at' => $response['created_at'] ?? now()
            ];

        } catch (\Exception $e) {
            \Log::error('Cloudinary PDF Upload Error: ' . $e->getMessage());
            \Log::error('Upload attempt details:', [
                'file_path' => $filePath,
                'folder' => $folder
            ]);
            throw new \Exception("Error al subir el archivo PDF: " . $e->getMessage());
        }
    }

    /**
     * Sube múltiples archivos PDF
     *
     * @param array $files Array de archivos PDF
     * @param string $folder Carpeta destino
     * @return array Resultados de las subidas
     */
    public function uploadMultiplePdfs(array $files, string $folder = 'pdfs')
    {
        $results = [];
        
        foreach ($files as $file) {
            try {
                $results[] = $this->uploadPdf($file, $folder);
            } catch (\Exception $e) {
                \Log::error('Error uploading multiple PDFs: ' . $e->getMessage());
                $results[] = [
                    'error' => true,
                    'message' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Genera URL para vista previa de PDF (primera página como imagen)
     *
     * @param string $publicId ID público del PDF
     * @param array $transformations Transformaciones adicionales
     * @return string URL de la vista previa
     */
    public function generatePdfPreviewUrl(string $publicId, array $transformations = [])
    {
        try {
            $defaultTransformations = [
                'page' => '1', // Primera página
                'format' => 'jpg', // Convertir a imagen
                'quality' => 'auto:good'
            ];

            $transformations = array_merge($defaultTransformations, $transformations);
            
            $baseUrl = "https://res.cloudinary.com/" . 'dqyxcnusl' . "/image/upload/";
            $transformationString = $this->buildTransformationString($transformations);
            
            return $baseUrl . $transformationString . '/' . $publicId;

        } catch (\Exception $e) {
            \Log::error('Error generating PDF preview URL: ' . $e->getMessage());
            throw new \Exception("Error al generar URL de vista previa del PDF: " . $e->getMessage());
        }
    }

    /**
     * Método genérico para subir cualquier tipo de archivo
     *
     * @param string $filePath Ruta del archivo
     * @param string $folder Carpeta destino
     * @param array $options Opciones adicionales
     * @return array
     */
    public function uploadFile(string $filePath, string $folder = 'files', array $options = [])
    {
        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'auto',
                'use_filename' => true,
                'unique_filename' => true
            ];

            $uploadOptions = array_merge($defaultOptions, $options);
            $response = $this->uploadApi->upload($filePath, $uploadOptions);

            return [
                'url' => $response['secure_url'],
                'public_id' => $response['public_id'],
                'format' => $response['format'],
                'bytes' => $response['bytes'],
                'resource_type' => $response['resource_type'],
                'created_at' => $response['created_at']
            ];

        } catch (\Exception $e) {
            \Log::error('Cloudinary File Upload Error: ' . $e->getMessage());
            throw new \Exception("Error al subir el archivo: " . $e->getMessage());
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

    /**
     * Elimina un archivo (PDF u otro tipo) de Cloudinary
     *
     * @param string $publicId ID público del archivo
     * @param string $resourceType Tipo de recurso ('image', 'raw', 'video', 'auto')
     * @return array
     */
    public function deleteFile(string $publicId, string $resourceType = 'auto')
    {
        try {
            $response = $this->uploadApi->destroy($publicId, [
                'resource_type' => $resourceType
            ]);
            
            if ($response['result'] !== 'ok') {
                \Log::warning('Cloudinary delete file warning: ' . json_encode($response));
            }

            return $response;

        } catch (\Exception $e) {
            \Log::error('Cloudinary Delete File Error: ' . $e->getMessage());
            throw new \Exception("Error al eliminar el archivo: " . $e->getMessage());
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

    /**
     * Obtiene información de cualquier tipo de archivo
     *
     * @param string $publicId ID público del archivo
     * @param string $resourceType Tipo de recurso
     * @return array
     */
    public function getFileInfo(string $publicId, string $resourceType = 'auto')
    {
        try {
            return $this->adminApi->asset($publicId, [
                'resource_type' => $resourceType
            ]);
        } catch (\Exception $e) {
            \Log::error('Cloudinary Get File Info Error: ' . $e->getMessage());
            throw new \Exception("Error al obtener información del archivo: " . $e->getMessage());
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