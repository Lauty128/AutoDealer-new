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
        Schema::table('stores', function (Blueprint $table) {
            $table->string('whatsapp_phone_number_id')->nullable()->after('meta_description');
            $table->string('whatsapp_catalog_id')->nullable()->after('whatsapp_phone_number_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_phone_number_id',
                'whatsapp_catalog_id',
            ]);
        });
    }
};
