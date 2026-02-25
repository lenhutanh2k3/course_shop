<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Category;
class Course extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'instructor',
        'original_price',
        'discounted_price',
        'category_id',
        'image_url',
        'download_file_path',
        'download_file_name',
        'is_published',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
    }

    public function getDiscountPercentage()
    {
        if ($this->original_price <= 0) return 0;
        return round((($this->original_price - $this->discounted_price) / $this->original_price) * 100);
    }
}
