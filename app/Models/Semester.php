<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use Blameable;
    protected $fillable = [
        'name',
        'number',
        'image',
        'public_id',
        'description',
        'is_active'
    ];
}
