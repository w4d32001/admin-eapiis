<?php

namespace App\Http\Controllers\Module\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryResource;
use App\Http\Resources\NewsResource;
use App\Http\Resources\SemesterResource;
use App\Http\Resources\TeacherResource;
use App\Models\Gallery;
use App\Models\News;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\TeacherType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        // Obtener datos de galerías (últimas 5)
        $galleries = Gallery::query()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Obtener noticias (últimas 5)
        $newsQuery = News::query()->orderBy('created_at', 'desc');
        if ($request->filled('search')) {
            $search = $request->get('search');
            $newsQuery->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }
        $news = $newsQuery->limit(5)->get();

        // Obtener semestres (últimos 3)
        $semesters = Semester::query()
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        // Obtener maestros con filtros (con paginación para mantener el formato)
        $teachersQuery = Teacher::with(['teacherType', 'creator']);
        if ($request->filled('teacher_search')) {
            $search = $request->get('teacher_search');
            $teachersQuery->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }
        if ($request->filled('teacher_type_id')) {
            $teachersQuery->where('teacher_type_id', $request->get('teacher_type_id'));
        }
        $teachers = $teachersQuery->paginate(8); // Usar paginate para mantener formato
        $teacherTypes = TeacherType::all();

        // Estadísticas adicionales
        $stats = [
            'total_galleries' => Gallery::count(),
            'total_news' => News::count(),
            'total_semesters' => Semester::count(),
            'total_teachers' => Teacher::count(),
        ];

        return Inertia::render("dashboard", [
            "galleries" => GalleryResource::collection($galleries),
            "news" => NewsResource::collection($news),
            "semesters" => SemesterResource::collection($semesters),
            "teachers" => [
                "teachers" => TeacherResource::collection($teachers->items()),
                "links" => $teachers->links(),
                "meta" => [
                    "current_page" => $teachers->currentPage(),
                    "last_page" => $teachers->lastPage(),
                    "total" => $teachers->total(),
                ]
            ],
            "teacherTypes" => $teacherTypes,
            "stats" => $stats,
            "filters" => $request->only(['search', 'teacher_search', 'teacher_type_id']),
        ]);
    }
}
