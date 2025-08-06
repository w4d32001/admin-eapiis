<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Module\Dashboard\DashboardController;
use App\Http\Controllers\Module\Gallery\GalleryController;
use App\Http\Controllers\Module\News\NewsController;
use App\Http\Controllers\Module\Semester\SemesterController;
use App\Http\Controllers\Module\Teacher\TeacherController;
use App\Http\Controllers\Module\Teacher\TeacherTypeController;
use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Admin\AdminApi;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [AuthenticatedSessionController::class, 'create']
)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';


Route::get('teacher-types', [TeacherTypeController::class, 'index'])->name('teacher-types.index');
Route::post('teacher-types', [TeacherTypeController::class, 'store'])->name('teacher-types.store');
Route::post('teacher-types/{teacher_type}', [TeacherTypeController::class, 'update'])->name('teacher-types.update');
Route::delete('teacher-types/{teacher_type}', [TeacherTypeController::class, 'destroy'])->name('teacher-types.destroy');

Route::get('teachers', [TeacherController::class, 'index'])->name('teachers.index');
Route::post('teachers', [TeacherController::class, 'store'])->name('teachers.store');
Route::post('teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.update');

Route::get('news', [NewsController::class, 'index'])->name('news.index');
Route::post('news', [NewsController::class, 'store'])->name('news.store');
Route::post('news/{news}', [NewsController::class, 'update'])->name('news.update');
Route::delete('news/{news}', [NewsController::class, 'destroy'])->name('news.destroy');
Route::patch('/news/{id}/toggle-status', [NewsController::class, 'toggleStatus'])->name('news.toggle-status');

Route::get('galleries', [GalleryController::class, 'index'])->name('galleries.index');
Route::post('galleries', [GalleryController::class, 'store'])->name('galleries.store');
Route::post('galleries/{gallery}', [GalleryController::class, 'update'])->name('galleries.update');
Route::delete('galleries/{gallery}', [GalleryController::class, 'destroy'])->name('galleries.destroy');

Route::get('semesters', [SemesterController::class, 'index'])->name('semesters.index');
Route::post('semesters', [SemesterController::class, 'store'])->name('semesters.store');
Route::post('semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
Route::delete('semesters/{semester}', [SemesterController::class, 'destroy'])->name('semesters.destroy');
Route::patch('semesters/{semester}/toggle-status', [SemesterController::class, 'toggleStatus'])->name('semesters.toggle-status');

/**/