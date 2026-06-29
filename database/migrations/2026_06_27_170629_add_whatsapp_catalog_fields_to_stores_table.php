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
            $table->string('whatsapp_catalog_id')->nullable()->after('whatsapp');
            $table->string('whatsapp_catalog_phone')->nullable()->after('whatsapp_catalog_id');
            $table->text('whatsapp_access_token')->nullable()->after('whatsapp_catalog_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_catalog_id',
                'whatsapp_catalog_phone',
                'whatsapp_access_token'
            ]);
        });
    }
};
