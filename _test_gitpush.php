<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = App\Models\User::where('username', 'memet')->first();
auth()->login($admin);

$controller = new App\Http\Controllers\BackupController();
$request = Illuminate\Http\Request::create('/backup/git-push', 'POST', ['message' => 'Test push from controller']);
$request->setUserResolver(fn() => $admin);

try {
    $response = $controller->gitPush($request);
    echo "OK: " . json_encode($response->getSession()->get('success') ?? $response->getSession()->get('error')) . "\n";
} catch (\Throwable $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
}
