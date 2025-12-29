import V3JourneyList from '@/components/v3/journeys/V3JourneyList';

export default function V3Journeys() {
    return (
        <V3Layout
            title="Journeys"
            initialActiveTab="journeys"
        >
            <V3JourneyList />
        </V3Layout>
    );
}
