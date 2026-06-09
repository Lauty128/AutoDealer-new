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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('vehicle_type_id')->constrained('vehicles_types')->onDelete('cascade');
            $table->foreignId('vehicle_mark_id')->constrained('vehicles_marks')->onDelete('cascade');
            $table->string('model');
            $table->integer('year');
            $table->decimal('price', 15, 2);
            $table->string('currency')->default('USD');
            $table->string('cover_image')->nullable();
            $table->string('plate')->nullable(); // matricula
            $table->string('engine')->nullable(); // motor
            $table->string('suspension')->nullable(); // suspension
            $table->string('fuel_type')->nullable(); // combustible
            $table->integer('mileage')->nullable(); // kilometraje
            $table->text('description')->nullable();
            $table->string('status')->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
