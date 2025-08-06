<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\TeacherType;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /*User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);*/
        TeacherType::create([
            "name" => "Docente Nombrado",
        ]);
        TeacherType::create([
            "name" => "Docente Contratado",
        ]);
        TeacherType::create([
            "name" => "Jefe de practica",
        ]);
        TeacherType::create([
            "name" => "DIRECTOR DEPARTAMENTO ACADEMICO",
        ]);
        TeacherType::create([
            "name" => "DIRECTOR ESCUELA PROFESIONAL",
        ]);

        User::create([
            "name" => "administrador",
            "email" => "datacentereapiis@unamba.edu.pe",
            "password" => Hash::make('123456789Eapiis')
        ]);
    }
}
