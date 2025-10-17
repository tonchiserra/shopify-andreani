export default function NoContent({ message, cta, ctaLabel }: { message: string, cta: string, ctaLabel: string }) {
    return (
        <s-section>
            <s-stack gap="base" alignItems="center" padding="large">
                <s-text type="strong" tone="auto">{message}</s-text>
                <s-button href={cta} variant="primary">{ctaLabel}</s-button>
            </s-stack>
        </s-section>
    )
}