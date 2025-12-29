import V3ContactList from '@/components/v3/contacts/V3ContactList';
import V3Layout from '@/components/v3/V3Layout';

export default function V3Contacts() {
    return (
        <V3Layout
            title="Contacts"
            initialActiveTab="contacts"
        >
            <V3ContactList />
        </V3Layout>
    );
}
