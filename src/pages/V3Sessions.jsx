import V3SessionList from '@/components/v3/sessions/V3SessionList';
import V3Layout from '@/components/v3/V3Layout';

export default function V3Sessions() {
    return (
        <V3Layout
            title="Sessions"
            initialActiveTab="sessions"
        >
            <V3SessionList />
        </V3Layout>
    );
}
