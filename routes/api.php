<?php

use App\Http\Controllers\Module\Gallery\GalleryController;
use App\Http\Controllers\Module\News\NewsController;
use App\Http\Controllers\Module\Semester\SemesterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('news', [NewsController::class, 'indexApi']);
Route::get('galleries', [GalleryController::class, 'indexApi']);
Route::get('semesters', [SemesterController::class, 'indexApi']);