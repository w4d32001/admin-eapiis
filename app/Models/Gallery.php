<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use Blameable;

    protected $fillable = [
        'type',
        'image',
        'public_id',
    ];

}
