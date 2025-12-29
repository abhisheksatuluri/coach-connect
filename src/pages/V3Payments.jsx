
import V3PaymentList from '@/components/v3/payments/V3PaymentList';
import V3Layout from '@/components/v3/V3Layout';

export default function V3Payments() {
    return (
        <V3Layout
            title="Payments"
            initialActiveTab="payments"
            showHeader={false}
        >
            <V3PaymentList />
        </V3Layout>
    );
}
