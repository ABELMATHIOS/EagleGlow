export default function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.3)' }} />
      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
        color: '#C9A84C', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap',
      }}>{text}</span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.3)' }} />
    </div>
  );
}