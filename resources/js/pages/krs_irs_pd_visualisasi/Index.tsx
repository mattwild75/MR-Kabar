import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function KrsIrsPdVisualisasi() {
    return (
        <AppLayout>
            <Head title="Diagram Hierarki KRS IRS PD" />
            <iframe
                src={route('krs_irs_pd.visualization.embed')}
                title="Diagram Hierarki KRS IRS PD"
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
