import YearFilterVisualization from '@/components/year-filter-visualization';

interface Props {
    tahunOptions: string[];
}

export default function KrsIrsPemdaVisualisasi({ tahunOptions }: Props) {
    return (
        <YearFilterVisualization
            title="Diagram Hierarki KRS IRS PEMDA"
            tahunOptions={tahunOptions}
            embedRouteName="krs_irs_pemda.visualization.embed"
        />
    );
}
