import V3PaymentList from '@/components/v3/payments/V3PaymentList';

export default function V3Payments() {
    return (
        <V3Layout title="Payments" initialActiveTab="more">
            <V3PaymentList />
        </V3Layout>
    );
}
