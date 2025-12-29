import V3TaskList from '@/components/v3/tasks/V3TaskList';
import V3Layout from '@/components/v3/V3Layout';

export default function V3Tasks() {
    return (
        <V3Layout title="Tasks" initialActiveTab="more">
            <V3TaskList />
        </V3Layout>
    );
}
