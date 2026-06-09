<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            
            // Redes Sociales & Contacto
            $table->string('whatsapp')->nullable();
            $table->string('instagram')->nullable();
            $table->string('facebook')->nullable();
            $table->string('tiktok')->nullable();
            $table->string('website')->nullable();

            // Personalización visual
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->string('primary_color')->nullable()->default('#0f172a'); // default slate-900
            $table->string('secondary_color')->nullable()->default('#3b82f6'); // default blue-500
            $table->text('custom_css')->nullable();

            // Presentación
            $table->text('presentation')->nullable();
            
            // Recomendados
            $table->json('working_hours')->nullable(); // horarios de atención
            $table->text('map_iframe')->nullable(); // mapa de google
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
