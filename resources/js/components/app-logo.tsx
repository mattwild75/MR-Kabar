import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
  const setting = usePage().props.setting as {
    nama_app?: string;
    logo?: string;
    logo_bg?: string | null;
    favicon?: string;
  } | null;

  const defaultAppName = 'Laravel Starter Kit';
  const defaultLogo = '';

  const appName = setting?.nama_app || defaultAppName;
  const imageSource = setting?.favicon || setting?.logo || defaultLogo;

  const img = (
    <img
      src={`/storage/${imageSource}`}
      alt="Logo"
      className="h-8 w-8 rounded-md object-contain"
    />
  );

  return (
    <div className="flex items-center gap-2">
      {imageSource ? (
        setting?.logo_bg ? (
          <span
            className="inline-flex items-center justify-center rounded-md p-1"
            style={{ backgroundColor: setting.logo_bg }}
          >
            {img}
          </span>
        ) : (
          img
        )
      ) : (
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
          <AppLogoIcon className="size-[1.375rem] fill-current text-primary-foreground dark:text-foreground" />
        </div>
      )}
      <div className="grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-none font-semibold">
          {appName}
        </span>
      </div>
    </div>
  );
}
