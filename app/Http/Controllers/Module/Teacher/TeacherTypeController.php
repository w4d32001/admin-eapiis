<?php

namespace App\Http\Controllers\Module\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherType\StoreRequest;
use App\Http\Requests\TeacherType\UpdateRequest;
use App\Http\Resources\TeacherTypeResource;
use App\Models\TeacherType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = TeacherType::with(['creator']);

        $teacherTypes = $query->paginate(15);
        return Inertia::render('teacher-type/index', [
            'teacherTypes' => TeacherTypeResource::collection($teacherTypes),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();
            

            $teacherType = TeacherType::create($data);

            return redirect()->back()->with('success', 'Tipo de docente registrado exitosamente.');

        } catch (\Exception $e) {
        
            return redirect()->back()->withErrors([
                'form' => 'Error al guardar el tipo de docente. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        try {
            $teacher = TeacherType::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            $teacher->update($data);


            return redirect()->back()->with('success', 'Docente actualizado exitosamente.');

        } catch (\Exception $e) {

            return redirect()->back()->withErrors([
                'form' => 'Error al actualizar el docente. Por favor, intenta nuevamente.',
            ])->withInput();
        }
    }

    public function destroy(string $id)
    {
        try {

            $teacherType = TeacherType::findOrFail($id);

            $teacherType->delete();


            return redirect()->back()->with('success', 'Docente eliminado exitosamente.');

        } catch (\Exception $e) {
          
            return redirect()->back()->withErrors([
                'error' => 'Error al eliminar el docente. Por favor, intenta nuevamente.'
            ]);
        }
    }
}
