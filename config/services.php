<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mercadopago' => [
        'token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        'sandbox' => env('MERCADOPAGO_SANDBOX', true),
    ],

    'autodealer' => [
        'support_num' => env('AUTODEALER_SUPPORT_INTEGRATIONS', '5491123456789'),
    ],

    'meta' => [
        'access_token' => env('META_ACCESS_TOKEN'),
        'catalog_id' => env('META_CATALOG_ID'),
        'waba_id' => env('META_WABA_ID'),
        'business_id' => env('META_BUSINESS_ID'),
        'client_id' => env('META_CLIENT_ID'),
        'client_secret' => env('META_CLIENT_SECRET'),
        'redirect_uri' => env('META_REDIRECT_URI'),
    ],

];
