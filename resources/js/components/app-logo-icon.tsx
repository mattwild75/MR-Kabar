import { usePage } from '@inertiajs/react';
import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  const setting = usePage().props.setting as {
    logo?: string;
    logo_bg?: string | null;
  } | null;

  // Default size used only when no className is passed in. Any className
  // prop from the caller (e.g. "size-20") fully replaces this default.
  const sizeClass = props.className || 'h-8 w-8';

  // Fallback ke SVG default
  if (!setting?.logo) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 24 24"
        className={sizeClass}
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12.963 2.286a.75.75 0 0 0-1.071-.136a9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545a3.75 3.75 0 0 1 3.255 3.717Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  const img = (
    <img
      src={`/storage/${setting.logo}`}
      alt="App Logo"
      className={`${sizeClass} object-contain`}
    />
  );

  // If a background color is configured, wrap the (likely transparent) logo
  // in a colored container instead of baking the color into the image file.
  if (setting.logo_bg) {
    return (
      <span
        className="inline-flex items-center justify-center rounded p-1"
        style={{ backgroundColor: setting.logo_bg }}
      >
        {img}
      </span>
    );
  }

  return img;
}
