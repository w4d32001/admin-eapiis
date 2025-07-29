<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use Blameable;

    protected $fillable = [
        'title',
        'date',
        'location',
        'content',
        'image',
        'public_id',
        'status',
    ];
}
