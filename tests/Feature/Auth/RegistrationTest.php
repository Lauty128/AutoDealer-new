<?php

use App\Notifications\AdminNewUserRegisteredNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Facades\Notification;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '1122334455',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
});

test('new users registration triggers notifications to user and admin', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '1122334455',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    // Retrieve the registered user
    $user = \App\Models\User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    // Verify verification email was sent to user
    Notification::assertSentTo(
        $user,
        VerifyEmailNotification::class
    );

    // Verify admin email registration notification was sent to lautarosilverii@gmail.com
    Notification::assertSentOnDemand(
        AdminNewUserRegisteredNotification::class,
        function ($notification, $channels, $notifiable) {
            return $notifiable->routes['mail'] === 'lautarosilverii@gmail.com';
        }
    );
});


