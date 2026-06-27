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
            $table->text('whatsapp_access_token')->nullable()->after('whatsapp_catalog_id');
            $table->string('whatsapp_business_id')->nullable()->after('whatsapp_access_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_access_token',
                'whatsapp_business_id',
            ]);
        });
    }
};
