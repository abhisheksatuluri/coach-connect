import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3DashboardContent from '@/components/v3/dashboard/V3DashboardContent';

export default function V3Journeys() {
    return (
        <V3Layout
            title="Journeys"
            initialActiveTab="journeys"
            initialOpenSlider="journeys"
        >
            <V3DashboardContent />
        </V3Layout>
    );
}
