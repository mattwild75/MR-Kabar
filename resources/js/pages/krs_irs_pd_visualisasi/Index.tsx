import YearFilterVisualization from '@/components/year-filter-visualization';

interface Props {
    tahunOptions: string[];
}

export default function KrsIrsPdVisualisasi({ tahunOptions }: Props) {
    return (
        <YearFilterVisualization
            title="Diagram Hierarki KRS IRS PD"
            tahunOptions={tahunOptions}
            embedRouteName="krs_irs_pd.visualization.embed"
        />
    );
}
