<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teacher extends Model
{
    use Blameable;

    protected $fillable = [
        "name",
        "academic_degree",
        "email",
        "phone",
        "image",
        "public_id",
        "teacher_type_id",
    ];

    public function teacherType():BelongsTo  
    {
        return $this->belongsTo(TeacherType::class);    
    }

}
