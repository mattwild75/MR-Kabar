import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...typescript.configs.recommended,
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'], // Required for React 17+
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        // Skrip perkakas Node (perekam video, pengambil tangkapan layar,
        // penyalin cadangan) memakai CommonJS: module, require, __dirname,
        // process. Konfigurasi di atas menyetel globals.browser saja, jadi
        // tanpa blok ini setiap berkas .cjs melaporkan ratusan
        // "'module' is not defined" - 856 galat, seluruhnya palsu.
        //
        // Berkas ini BUKAN kode aplikasi dan tidak pernah ikut ke peramban;
        // yang diperiksa cukup bahwa sintaksnya sah dan global Node-nya
        // dikenali.
        files: ['**/*.cjs', 'video-tutorial/**/*.js', 'video-edukasi/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // require() memang cara yang benar di CommonJS. Aturan bawaan
            // typescript-eslint melarangnya karena mengandaikan modul ES.
            '@typescript-eslint/no-require-imports': 'off',
            // Skrip perkakas kerap menangkap galat tanpa memakai variabelnya.
            '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none', argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: [
            'vendor',
            'node_modules',
            'public',
            'bootstrap/ssr',
            'tailwind.config.js',
            // Berkas antara hasil build video - dirakit skrip Python, bukan
            // ditulis tangan, dan sebagian memuat literal raksasa.
            'video-edukasi/**/animation.html',
            'video-edukasi/**/scenes.js',
        ],
    },
    prettier, // Turn off all rules that might conflict with Prettier
];
