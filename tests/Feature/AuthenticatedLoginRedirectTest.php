<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticatedLoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_are_redirected_from_the_login_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/login')
            ->assertRedirect(route('dashboard'));
    }
}
