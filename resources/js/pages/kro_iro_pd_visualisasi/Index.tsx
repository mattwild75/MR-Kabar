import YearFilterVisualization from '@/components/year-filter-visualization';

interface Props {
    tahunOptions: string[];
}

export default function KroIroPdVisualisasi({ tahunOptions }: Props) {
    return (
        <YearFilterVisualization
            title="Diagram Hierarki KRO IRO PD"
            tahunOptions={tahunOptions}
            embedRouteName="kro_iro_pd.visualization.embed"
        />
    );
}
