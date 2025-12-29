import V3NoteList from '@/components/v3/notebook/V3NoteList';

export default function V3Notebook() {
    return (
        <V3Layout title="Notebook" initialActiveTab="more">
            <V3NoteList />
        </V3Layout>
    );
}
