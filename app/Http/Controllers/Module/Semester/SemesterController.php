<?php

namespace App\Http\Controllers\Module\Semester;

use App\Http\Controllers\Controller;
use App\Http\Requests\Semester\StoreRequest;
use App\Http\Requests\Semester\UpdateRequest;
use App\Http\Resources\SemesterResource;
use App\Http\Services\CloudinaryService;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function index()
    {
        $query = Semester::query()->orderBy('created_at', 'desc');

        $semesters = $query->paginate(15);

        return Inertia::render("semester/index", [
            "semesters" => SemesterResource::collection($semesters),
        ]);
    }

    public function indexApi()
    {
        $query = Semester::query()->orderBy('created_at', 'desc');

        $semesters = $query->paginate(15);

        return response()->json(["data" => $semesters]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();

            $ordinals = [
                1 => 'Primer',
                2 => 'Segundo',
                3 => 'Tercer',
                4 => 'Cuarto',
                5 => 'Quinto',
                6 => 'Sexto',
                7 => 'Séptimo',
                8 => 'Octavo',
                9 => 'Noveno',
                10 => 'Décimo'
            ];
            $data['name'] = $ordinals[$data['number']] . ' Semestre';

            if ($request->hasFile('image')) {
                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            }

            Semester::create($data);

            return redirect()->back()->with('success', 'Semestre creado exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error creando semestre: ' . $e->getMessage(), [
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al crear el semestre. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id)
    {
        try {
            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            $semester = Semester::findOrFail($id);

            if (isset($data['number']) && $data['number'] !== $semester->number) {
                $ordinals = [
                    1 => 'Primer',
                    2 => 'Segundo',
                    3 => 'Tercer',
                    4 => 'Cuarto',
                    5 => 'Quinto',
                    6 => 'Sexto',
                    7 => 'Séptimo',
                    8 => 'Octavo',
                    9 => 'Noveno',
                    10 => 'Décimo'
                ];
                $data['name'] = $ordinals[$data['number']] . ' Semestre';
            }

            if ($request->hasFile('image')) {
                if ($semester->public_id) {
                    $this->deleteOldImage($semester->public_id);
                }

                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            }

            $semester->update($data);

            return redirect()->back()->with('success', 'Semestre actualizado exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error actualizando semestre: ' . $e->getMessage(), [
                'semester_id' => $semester->id,
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al actualizar el semestre. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {

            $semester = Semester::findOrFail($id);
            if ($semester->public_id) {
                $this->deleteOldImage($semester->public_id);
            }

            $semester->delete();

            return redirect()->back()->with('success', 'Semestre eliminado exitosamente.');
        } catch (\Exception $e) {
            \Log::error('Error eliminando semestre: ' . $e->getMessage(), [
                'semester_id' => $semester->id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al eliminar el semestre. Por favor, intenta nuevamente.',
            ]);
        }
    }

    public function toggleStatus(string $id)
    {
        try {
            $semester = Semester::findOrFail($id);
            $semester->update([
                'is_active' => !$semester->is_active,
                'updated_by' => auth()->id()
            ]);

            $status = $semester->is_active ? 'activado' : 'desactivado';
            return redirect()->back()->with('success', "Semestre {$status} exitosamente.");
        } catch (\Exception $e) {
            \Log::error('Error cambiando estado del semestre: ' . $e->getMessage(), [
                'semester_id' => $semester->id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al cambiar el estado del semestre.',
            ]);
        }
    }
    private function handleImageUpload($file)
    {
        try {
            $result = $this->cloudinaryService->uploadImage(
                $file->getRealPath(),
                'semesters'
            );

            return [
                'image' => $result['url'],
                'public_id' => $result['public_id']
            ];

        } catch (\Exception $e) {
            \Log::error('Error uploading image: ' . $e->getMessage());
            throw new \Exception('Error al subir la imagen. Por favor, intenta nuevamente.');
        }
    }
    private function deleteOldImage($publicId)
    {
        try {
            $this->cloudinaryService->deleteImage($publicId);
        } catch (\Exception $e) {
            \Log::warning('Error deleting old image: ' . $e->getMessage(), [
                'public_id' => $publicId
            ]);
        }
    }
}
