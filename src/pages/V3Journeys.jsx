
import V3JourneyList from '@/components/v3/journeys/V3JourneyList';
import V3Layout from '@/components/v3/V3Layout';

export default function V3Journeys() {
    return (
        <V3Layout
            title="Journeys"
            initialActiveTab="journeys"
            showHeader={false}
        >
            <V3JourneyList />
        </V3Layout>
    );
}
