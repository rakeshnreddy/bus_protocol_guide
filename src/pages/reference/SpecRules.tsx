import { Link } from 'react-router-dom';
import SpecRuleExplorer from '../../components/visuals/SpecRuleExplorer';

export default function SpecRules() {
  return (
    <div className="page-container">
      <h2>Specification Rules & Bugs</h2>
      <p>
        A searchable index of "shall/must" specification rules directly tied to common bug patterns. 
        For narrative case studies, see the full lessons for <Link to="/lesson/33_common_rtl_bugs">AHB</Link> and <Link to="/lesson/38_common_rtl_bugs">AXI</Link>.
      </p>
      
      <div style={{ marginTop: '2rem' }}>
        <SpecRuleExplorer />
      </div>
    </div>
  );
}
