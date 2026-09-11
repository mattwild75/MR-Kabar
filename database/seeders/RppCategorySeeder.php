<?php

namespace Database\Seeders;

use App\Models\RppCategory;
use Illuminate\Database\Seeder;

class RppCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => 'A', 'name' => 'Reviu'],
            ['code' => 'B', 'name' => 'Khusus'],
            ['code' => 'C', 'name' => 'Operasional SKPK'],
            ['code' => 'D', 'name' => 'Operasional Gampong'],
            ['code' => 'E', 'name' => 'Kasus Gampong'],
            ['code' => 'F', 'name' => 'Kasus SKPK'],
            ['code' => 'G', 'name' => 'Monitoring'],
            ['code' => 'H', 'name' => 'Evaluasi'],
        ];

        foreach ($categories as $i => $category) {
            RppCategory::updateOrCreate(
                ['code' => $category['code']],
                ['name' => $category['name'], 'order' => $i + 1]
            );
        }
    }
}
