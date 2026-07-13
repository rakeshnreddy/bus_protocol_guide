
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
  navigation?: {
    current: number;
    total: number;
    previous?: Pick<Lesson, 'id' | 'title'>;
    next?: Pick<Lesson, 'id' | 'title'>;
  };
}

export default function LessonRenderer({ lesson, body, navigation }: LessonRendererProps) {
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
          <div className="inline-visual-wrapper">
            <VisualRenderer visualRef={{ id: visualId, type: 'waveform', dataFile: '' }} altText={alt} />
            {alt && (
              <div className="inline-visual-caption">
                Figure: {alt}
              </div>
            )}
          </div>
        );
      }
      return <img className="lesson-image" src={src} alt={alt} />;
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
        {navigation && (
          <div className="lesson-progress" aria-label={`Lesson ${navigation.current} of ${navigation.total}`}>
            <span>{lesson.protocol.toUpperCase()} path</span>
            <strong>{String(navigation.current).padStart(2, '0')} / {String(navigation.total).padStart(2, '0')}</strong>
            <span className="lesson-progress-track" aria-hidden="true"><span style={{ width: `${(navigation.current / navigation.total) * 100}%` }} /></span>
          </div>
        )}
        <span className="lesson-tier">{lesson.tier.toUpperCase()} <span aria-hidden="true">•</span> {lesson.level.toUpperCase()}</span>
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
          <div className="resource-section">
            {lesson.checklistIds.map(id => {
              const cl = getChecklistById(id);
              return cl ? <ChecklistViewer key={id} checklist={cl} /> : <div key={id}>Checklist missing: {id}</div>;
            })}
          </div>
        )}
        
        {lesson.exerciseIds && lesson.exerciseIds.length > 0 && (
          <div className="resource-section">
            <h2>Check your understanding</h2>
            {lesson.exerciseIds.map(id => {
              const ex = getExerciseById(id);
              return ex ? <InteractiveExercise key={id} exercise={ex} /> : <div key={id}>Exercise missing: {id}</div>;
            })}
          </div>
        )}

        {(lesson.prerequisites?.length > 0 || lesson.relatedLessons?.length > 0 || lesson.glossaryTerms?.length > 0) && (
          <div className="resource-section related-concepts-panel">
            
            {lesson.prerequisites && lesson.prerequisites.length > 0 && (
              <div className="related-concept-group">
                <h2>Prerequisites</h2>
                <p>What you should know before this:</p>
                <ul>
                  {lesson.prerequisites.map(id => (
                    <li key={id}>
                      <Link to={`/lesson/${id}`}>{id}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
              <div className="related-concept-group">
                <h2>Related lessons</h2>
                <p>Explore further:</p>
                <ul>
                  {lesson.relatedLessons.map(id => (
                    <li key={id}>
                      <Link to={`/lesson/${id}`}>{id}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.glossaryTerms && lesson.glossaryTerms.length > 0 && (
              <div className="related-concept-group">
                <h2>Key terms used</h2>
                <p>Vocabulary in this lesson:</p>
                <div className="glossary-term-links">
                  {lesson.glossaryTerms.map(term => (
                    <Link key={term} to={`/glossary#${term}`}>
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {navigation && (navigation.previous || navigation.next) && (
          <nav className="lesson-sequence-nav" aria-label="Lesson sequence">
            {navigation.previous ? (
              <Link className="lesson-sequence-link previous" to={`/lesson/${navigation.previous.id}`}>
                <span>Previous lesson</span><strong>{navigation.previous.title}</strong>
              </Link>
            ) : <span />}
            {navigation.next && (
              <Link className="lesson-sequence-link next" to={`/lesson/${navigation.next.id}`}>
                <span>Next lesson</span><strong>{navigation.next.title}</strong>
              </Link>
            )}
          </nav>
        )}

      </footer>
    </article>
  );
}
