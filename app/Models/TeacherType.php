<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherType extends Model
{
    use Blameable;
    protected $fillable = [
        "name",
    ];

    public function teacher(): HasMany
    {
        return $this->hasMany(Teacher::class);
    }

}
