
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Lesson } from '../types/content';
import VisualRenderer from './visuals/VisualRenderer';
import InteractiveExercise from './interactive/InteractiveExercise';
import ChecklistViewer from './interactive/ChecklistViewer';
import { getExerciseById, getChecklistById, getGlossaryEntries } from '../lib/loaders';
import { Link } from 'react-router-dom';
import GlossaryTermInline from './interactive/GlossaryTermInline';
import type { Components } from 'react-markdown';
import './interactive/interactive.css';

interface LessonRendererProps {
  lesson: Lesson;
  body: string;
}

export default function LessonRenderer({ lesson, body }: LessonRendererProps) {
  const components: Components = {
    p: ({ node, children }: any) => {
      // Check if any child is an image with visual: prefix
      const hasVisual = node?.children?.some((child: any) => 
        child.type === 'element' && 
        child.tagName === 'img' && 
        child.properties?.src?.startsWith('visual:')
      );
      
      if (hasVisual) {
        return <div className="paragraph-with-visual">{children}</div>;
      }
      return <p>{children}</p>;
    },
    img: ({ src, alt }) => {
      if (src && src.startsWith('visual:')) {
        const visualId = src.replace('visual:', '');
        // We pass 'waveform' as a dummy type; VisualRenderer resolves the true type via getVisualById
        return (
          <div className="inline-visual-wrapper" style={{ margin: '2.5rem 0' }}>
            <VisualRenderer visualRef={{ id: visualId, type: 'waveform', dataFile: '' }} altText={alt} />
            {alt && (
              <div className="inline-visual-caption" style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '0.75rem', fontStyle: 'italic' }}>
                Figure: {alt}
              </div>
            )}
          </div>
        );
      }
      return <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '8px' }} />;
    },
    a: ({ href, children }) => {
      if (href && href.startsWith('glossary:')) {
        const termId = href.replace('glossary:', '');
        const entries = getGlossaryEntries();
        const term = entries.find(g => g.term === termId);
        
        if (term) {
          return <GlossaryTermInline term={term}>{children}</GlossaryTermInline>;
        }
        return <span className="glossary-term-inline" title="Term not found"><span className="term-text">{children}</span></span>;
      }
      return <a href={href}>{children}</a>;
    }
  };

  return (
    <article className="lesson-renderer">
      <header className="lesson-header">
        <span className="lesson-tier">{lesson.tier.toUpperCase()} • {lesson.level.toUpperCase()}</span>
        <h1 className="lesson-title">{lesson.title}</h1>
        <p className="lesson-summary">{lesson.summary}</p>
        
        {lesson.tags && lesson.tags.length > 0 && (
          <div className="lesson-tags">
            {lesson.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </header>
      
      <div className="lesson-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={(url) => url}>
          {body}
        </ReactMarkdown>
      </div>
      
      <footer className="lesson-footer">
        
        {lesson.checklistIds && lesson.checklistIds.length > 0 && (
          <div className="resource-section" style={{ marginTop: '3rem' }}>
            {lesson.checklistIds.map(id => {
              const cl = getChecklistById(id);
              return cl ? <ChecklistViewer key={id} checklist={cl} /> : <div key={id}>Checklist missing: {id}</div>;
            })}
          </div>
        )}
        
        {lesson.exerciseIds && lesson.exerciseIds.length > 0 && (
          <div className="resource-section" style={{ marginTop: '3rem' }}>
            <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Check your understanding</h3>
            {lesson.exerciseIds.map(id => {
              const ex = getExerciseById(id);
              return ex ? <InteractiveExercise key={id} exercise={ex} /> : <div key={id}>Exercise missing: {id}</div>;
            })}
          </div>
        )}

        {(lesson.prerequisites?.length > 0 || lesson.relatedLessons?.length > 0 || lesson.glossaryTerms?.length > 0) && (
          <div className="resource-section related-concepts-panel" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            
            {lesson.prerequisites && lesson.prerequisites.length > 0 && (
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Prerequisites</h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>What you should know before this:</p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#334155' }}>
                  {lesson.prerequisites.map(id => (
                    <li key={id} style={{ marginBottom: '0.25rem' }}>
                      <Link to={`/lesson/${id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{id}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Related Lessons</h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Explore further:</p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#334155' }}>
                  {lesson.relatedLessons.map(id => (
                    <li key={id} style={{ marginBottom: '0.25rem' }}>
                      <Link to={`/lesson/${id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{id}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.glossaryTerms && lesson.glossaryTerms.length > 0 && (
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Key Terms Used</h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Vocabulary in this lesson:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {lesson.glossaryTerms.map(term => (
                    <Link key={term} to={`/glossary#${term}`} style={{ 
                      backgroundColor: '#f1f5f9', color: '#2563eb', padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', fontSize: '0.85rem', textDecoration: 'none',
                      border: '1px solid #e2e8f0'
                    }}>
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </footer>
    </article>
  );
}
