<?php

namespace Tests\Feature;

use Tests\TestCase;

class RootRouteTest extends TestCase
{
    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get('/')
            ->assertRedirect(route('login'));
    }
}
