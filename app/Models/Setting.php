<?php

namespace App\Models;

use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use Blameable;

    protected $fillable = [
        "name",
        "image",
        "public_id",
    ];
}
