<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    @php
        $setting = $page['props']['setting'] ?? null;
        $appName = $setting['nama_app'] ?? config('app.name', 'Laravel');
        $favicon = $setting['favicon'] ?? null;
    @endphp

    <title inertia>{{ $appName }}</title>

    {{-- Apply the stored appearance preference before first paint, so the
         page never flashes the wrong theme while React boots and runs
         initializeTheme(). Mirrors the light/dark/system logic in
         resources/js/hooks/use-appearance.tsx. --}}
    <script>
        (function () {
            try {
                var stored = localStorage.getItem('appearance');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
                if (isDark) {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {
                // localStorage/matchMedia unavailable — fall back to light.
            }
        })();
    </script>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @if (!empty($favicon))
        <link rel="icon" href="{{ asset('storage/' . $favicon) }}" type="image/png">
    @else
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
    @endif


    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
