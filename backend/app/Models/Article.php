<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    // This whitelist tells Laravel: "It is safe to save these 4 columns"
    protected $fillable = [
        'title',
        'content',
        'original_url',
        'status'
    ];
}