import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3DashboardContent from '@/components/v3/dashboard/V3DashboardContent';

import PremiumScrollContainer from '@/components/v3/shared/PremiumScrollContainer';

export default function V3Dashboard() {
    return (
        <V3Layout title="Dashboard" initialActiveTab="dashboard">
            <PremiumScrollContainer>
                <V3DashboardContent />
            </PremiumScrollContainer>
        </V3Layout>
    );
}
