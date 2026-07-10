import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function KroIroPdVisualisasi() {
    return (
        <AppLayout>
            <Head title="Diagram Hierarki KRO IRO PD" />
            <iframe
                src={route('kro_iro_pd.visualization.embed')}
                title="Diagram Hierarki KRO IRO PD"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 4rem)',
                    border: 'none',
                    display: 'block',
                }}
            />
        </AppLayout>
    );
}
