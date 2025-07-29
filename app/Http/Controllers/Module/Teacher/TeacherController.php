<?php

namespace App\Http\Controllers\Module\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreRequest;
use App\Http\Requests\Teacher\UpdateRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use App\Models\TeacherType;
use App\Http\Services\CloudinaryService;
use Illuminate\Http\Client\ResponseSequence;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }
    public function index(Request $request)
    {
        $query = Teacher::with(['teacherType', 'creator']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('teacher_type_id')) {
            $query->where('teacher_type_id', $request->get('teacher_type_id'));
        }

        $teachers = $query->paginate(15);
        $teacherTypes = TeacherType::all();

        return Inertia::render("teacher/index", [
            "teachers" => TeacherResource::collection($teachers),
            "teacherTypes" => $teacherTypes,
            "filters" => $request->only(['search', 'teacher_type_id'])
        ]);
    }

    public function indexApi(Request $request)
    {
        $query = Teacher::with(['teacherType', 'creator']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('teacher_type_id')) {
            $query->where('teacher_type_id', $request->get('teacher_type_id'));
        }

        $teachers = $query->paginate(15);
        $teacherTypes = TeacherType::all();

        return response()->json([
            "teachers" => TeacherResource::collection($teachers),
            "teacherTypes" => $teacherTypes,
            "filters" => $request->only(['search', 'teacher_type_id'])
        ]);
    }

    public function store(StoreRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $data['created_by'] = auth()->id();

            if ($request->hasFile('image')) {
                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            }

            $teacher = Teacher::create($data);

            DB::commit();

            return redirect()->back()->with('success', 'Docente registrado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating teacher: ' . $e->getMessage(), [
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al guardar el docente. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function show(string $id)
    {
        $teacher = Teacher::with(['teacherType', 'creator'])->findOrFail($id);

        return Inertia::render("teacher/show", [
            "teacher" => new TeacherResource($teacher)
        ]);
    }
    public function update(UpdateRequest $request, string $id)
    {
        try {
            DB::beginTransaction();

            $teacher = Teacher::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            if ($request->hasFile('image')) {
                if ($teacher->public_id) {
                    $this->deleteOldImage($teacher->public_id);
                }

                $imageData = $this->handleImageUpload($request->file('image'));
                $data = array_merge($data, $imageData);
            } else {
                unset($data['image']);
                unset($data['public_id']);
            }

            $teacher->update($data);

            DB::commit();

            return redirect()->back()->with('success', 'Docente actualizado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating teacher: ' . $e->getMessage(), [
                'teacher_id' => $id,
                'data' => $data ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'form' => 'Error al actualizar el docente. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $teacher = Teacher::findOrFail($id);

            if ($teacher->public_id) {
                $this->deleteOldImage($teacher->public_id);
            }

            $teacher->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Docente eliminado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting teacher: ' . $e->getMessage(), [
                'teacher_id' => $id,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Error al eliminar el docente. Por favor, intenta nuevamente.'
            ]);
        }
    }
    private function handleImageUpload($file)
    {
        try {
            $result = $this->cloudinaryService->uploadImage(
                $file->getRealPath(),
                'teachers'
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
