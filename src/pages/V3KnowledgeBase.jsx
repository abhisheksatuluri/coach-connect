import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3KnowledgeBaseComponent from '@/components/v3/knowledgebase/V3KnowledgeBase';

export default function V3KnowledgeBase() {
    return (
        <V3Layout title="Knowledge Base" initialActiveTab="more" showHeader={false}>
            <V3KnowledgeBaseComponent />
        </V3Layout>
    );
}
