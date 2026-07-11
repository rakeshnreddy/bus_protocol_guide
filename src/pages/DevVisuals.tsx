import { getAllVisuals } from '../lib/visualLoaders';
import VisualRenderer from '../components/visuals/VisualRenderer';

export default function DevVisuals() {
  const visuals = getAllVisuals();
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Visual Engine Dev Viewer</h1>
      <p style={{ color: '#64748b', marginBottom: '3rem' }}>
        This route is for internal testing of visual components. It loops through all seeded data in <code>content/visuals/</code> and renders them using the <code>VisualRenderer</code> wrapper.
      </p>
      
      {visuals.length === 0 && (
        <p>No visuals found. Please check your data loaders.</p>
      )}
      
      {visuals.map(v => (
        <div key={v.id} style={{ marginBottom: '4rem' }}>
          <VisualRenderer visualRef={{ id: v.id, type: v.type, dataFile: '' }} />
        </div>
      ))}
    </div>
  );
}
