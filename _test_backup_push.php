<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = App\Models\User::where('username', 'memet')->first();
auth()->login($admin);

$before = count(glob(storage_path('app/private/Laravel/*.zip')));

$controller = new App\Http\Controllers\BackupController();
$request = Illuminate\Http\Request::create('/backup/git-push', 'POST', ['message' => 'Test combined backup+push']);
$request->setUserResolver(fn() => $admin);

try {
    $response = $controller->gitPush($request);
    $msg = $response->getSession()->get('success') ?? $response->getSession()->get('error');
    echo "Result: $msg\n";
} catch (\Throwable $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
}

$after = count(glob(storage_path('app/private/Laravel/*.zip')));
echo "Backup files before=$before, after=$after\n";
