export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page Working!</h1>
      <p>If you can see this, basic routing is working.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  )
} 