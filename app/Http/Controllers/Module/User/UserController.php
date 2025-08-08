<?php

namespace App\Http\Controllers\Module\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $query = User::query()->orderBy('created_at', 'desc');

        $users = $query->paginate(15);

        return Inertia::render("user/index", [
            "users" => $users,
        ]);
    }

    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $relations = $this->checkUserRelations($user);
            
            if (!empty($relations)) {
                Log::warning('Intento de eliminar usuario con relaciones', [
                    'user_id' => $id,
                    'relations' => $relations,
                    'attempted_by' => auth()->id()
                ]);

                return redirect()->back()->withErrors([
                    'message' => 'No se puede eliminar el usuario porque tiene registros asociados',
                    'relations' => $relations
                ]);
            }
            $userName = $user->name;
            $user->delete();
            
            Log::info('Usuario eliminado exitosamente', [
                'user_id' => $id,
                'user_name' => $userName,
                'deleted_by' => auth()->id()
            ]);
            
            return redirect()->back()->with('success', 'Usuario eliminado exitosamente.');
            
        } catch (\Exception $e) {
            Log::error('Error eliminando usuario: ' . $e->getMessage(), [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempted_by' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'message' => 'Error al eliminar el usuario. Por favor, intenta nuevamente.'
            ]);
        }
    }

    private function checkUserRelations(User $user)
    {
        $relations = [];
        
        $createdRecords = $this->getCreatedRecords($user->id);
        if ($createdRecords > 0) {
            $relations['created_records'] = [
                'count' => $createdRecords,
                'message' => "Ha creado {$createdRecords} registro(s)"
            ];
        }
        
        $updatedRecords = $this->getUpdatedRecords($user->id);
        if ($updatedRecords > 0) {
            $relations['updated_records'] = [
                'count' => $updatedRecords,
                'message' => "Ha actualizado {$updatedRecords} registro(s)"
            ];
        }
        
       
        return $relations;
    }

 
    private function getCreatedRecords($userId)
    {
        $count = 0;
        $tables = [
            'news',
             'teachers', 
            'teacher_types',
            'galleries',
            'semesters',
        ];
        
        foreach ($tables as $table) {
            try {
                $count += DB::table($table)->where('created_by', $userId)->count();
            } catch (\Exception $e) {
                Log::warning("Error contando registros creados en tabla {$table}: " . $e->getMessage());
            }
        }
        
        return $count;
    }

    private function getUpdatedRecords($userId)
    {
        $count = 0;
        
        $tables = [
            'news',
            'teachers', 
            'teacher_types',
            'galleries',
            'semesters',
        ];
        
        foreach ($tables as $table) {
            try {
                $count += DB::table($table)
                    ->where('updated_by', $userId)
                    ->where('updated_by', '!=', DB::raw('created_by')) 
                    ->count();
            } catch (\Exception $e) {
                Log::warning("Error contando registros actualizados en tabla {$table}: " . $e->getMessage());
            }
        }
        
        return $count;
    }

    public function forceDestroy(string $id)
    {
        try {
            if (!auth()->user()->hasRole('admin')) { 
                return redirect()->back()->withErrors([
                    'message' => 'No tienes permisos para realizar esta acción.'
                ]);
            }

            $user = User::findOrFail($id);
            
            $this->cleanupUserReferences($user->id);
            
            $userName = $user->name;
            $user->delete();
            
            Log::warning('Usuario eliminado forzadamente', [
                'user_id' => $id,
                'user_name' => $userName,
                'forced_by' => auth()->id()
            ]);
            
            return redirect()->back()->with('success', 'Usuario eliminado forzadamente.');
            
        } catch (\Exception $e) {
            Log::error('Error en eliminación forzada: ' . $e->getMessage(), [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'attempted_by' => auth()->id()
            ]);

            return redirect()->back()->withErrors([
                'message' => 'Error al eliminar el usuario forzadamente.'
            ]);
        }
    }


    private function cleanupUserReferences($userId)
    {
        $tables = [
            'news',
            'teachers', 
            'teacher_types',
            'galleries',
            'semesters',
        ];
        
        foreach ($tables as $table) {
            try {
                DB::table($table)
                    ->where('created_by', $userId)
                    ->update(['created_by' => null]);
                    
                DB::table($table)
                    ->where('updated_by', $userId)
                    ->update(['updated_by' => null]);
            } catch (\Exception $e) {
                Log::warning("Error limpiando referencias en tabla {$table}: " . $e->getMessage());
            }
        }
    }
}