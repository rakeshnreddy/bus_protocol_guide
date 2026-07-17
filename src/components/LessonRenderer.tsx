
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
import { getVisualById } from '../lib/visualLoaders';
import type { VisualData } from '../types/visuals';
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

const visualTypeLabels: Record<VisualData['type'], string> = {
  waveform: 'Waveform',
  timeline: 'Timeline',
  topology: 'Block diagram',
  'signal-explorer': 'Signal explorer',
  'coverage-map': 'Coverage map',
  'formal-property': 'Formal property',
  'spec-rule-explorer': 'Rule explorer',
  'checker-model': 'Executable checker model',
};

const visualInspectionPrompts: Record<VisualData['type'], string> = {
  waveform: 'Move across the cycles. Identify the accepting edge, phase owner, stalled state, and any payload that must remain stable.',
  timeline: 'Follow the lanes in order, then select a phase to explain overlap, completion, and transaction ownership.',
  topology: 'Trace the highlighted path from source to destination, then inspect blocks and routes to explain responsibility and direction.',
  'signal-explorer': 'Open signals by group and connect direction, sampling, important values, and the verification watchpoint.',
  'coverage-map': 'Inspect covered bins, holes, and exclusions. Explain which transaction context makes each combination meaningful.',
  'formal-property': 'Change the editable scenario, compare pass and fail states, and explain the sampled obligation at the failing edge.',
  'spec-rule-explorer': 'Filter to the relevant rule, then connect its obligation to the waveform symptom and checker evidence.',
  'checker-model': 'Choose a scenario, execute accepted events, inspect retained state, and connect each result to signoff evidence.',
};

const ownershipRecallPrompts: Record<Lesson['protocol'], string> = {
  ahb: 'Which accepted address phase owns the data and response phase you would debug?',
  axi: 'Which VALID and READY edge creates the event, and how would you correlate its later response?',
  foundations: 'Which component or protocol boundary owns each part of the transaction?',
};

function LessonWorkflow({ lesson }: { lesson: Lesson }) {
  const visualCount = lesson.visualIds.length;
  const hasAssessment = lesson.exerciseIds.length > 0 || lesson.checklistIds.length > 0;

  return (
    <section className="lesson-workflow" aria-labelledby={`${lesson.id}-workflow-title`}>
      <div className="lesson-workflow-heading">
        <h2 id={`${lesson.id}-workflow-title`}>Lesson workflow</h2>
        <p>Build the model, inspect the evidence, then retrieve the rule from memory.</p>
      </div>
      <ol>
        <li>
          <strong>Read the concept</strong>
          <span>Track ownership, sampling, and the protocol condition being taught.</span>
        </li>
        {visualCount > 0 && (
          <li>
            <strong>Inspect {visualCount} visual{visualCount === 1 ? '' : 's'}</strong>
            <span>Use focus, Enter, Space, or touch to open the annotations.</span>
          </li>
        )}
        <li>
          <strong>{hasAssessment ? 'Test the model' : 'Recall the rule'}</strong>
          <span>{hasAssessment
            ? 'Complete the lesson check, then explain why the answer is correct.'
            : 'Name the critical edge and the verifier evidence without looking back.'}</span>
        </li>
      </ol>
    </section>
  );
}

function LessonRetentionPanel({ lesson }: { lesson: Lesson }) {
  const handleSummaryKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    const details = event.currentTarget.closest('details');
    if (details) details.open = !details.open;
  };

  return (
    <section className="lesson-retention" aria-labelledby={`${lesson.id}-retention-title`}>
      <div className="lesson-retention-heading">
        <div>
          <h2 id={`${lesson.id}-retention-title`}>Retain the model</h2>
          <p>Close the loop before moving to the next lesson.</p>
        </div>
        <span>60 seconds</span>
      </div>
      <details>
        <summary onKeyDown={handleSummaryKeyDown}>
          <span>Run the retrieval check</span>
          <span className="retention-summary-count">3 prompts</span>
        </summary>
        <ol>
          <li>
            <strong>Explain</strong>
            <span>Describe {lesson.title} in your own words without repeating the lesson summary.</span>
          </li>
          <li>
            <strong>Locate</strong>
            <span>{ownershipRecallPrompts[lesson.protocol]}</span>
          </li>
          <li>
            <strong>Verify</strong>
            <span>What assertion, scoreboard state, or coverage point would expose the most important failure?</span>
          </li>
        </ol>
      </details>
    </section>
  );
}

export default function LessonRenderer({ lesson, body, navigation }: LessonRendererProps) {
  const exerciseEntries = lesson.exerciseIds.map(id => ({ id, exercise: getExerciseById(id) }));
  const diagnosticLabs = exerciseEntries.filter(entry => entry.exercise?.type === 'diagnostic-lab');
  const reviewExercises = exerciseEntries.filter(entry => entry.exercise && entry.exercise.type !== 'diagnostic-lab');
  const missingExercises = exerciseEntries.filter(entry => !entry.exercise);

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
        const visual = getVisualById(visualId);
        const visualType = visual?.type;
        const visualPosition = Math.max(lesson.visualIds.indexOf(visualId), 0) + 1;
        const visualTotal = Math.max(lesson.visualIds.length, 1);
        const contextId = `${lesson.id}-${visualId}-inspection-guide`;
        // We pass 'waveform' as a dummy type; VisualRenderer resolves the true type via getVisualById
        return (
          <section
            className="inline-visual-wrapper visual-learning-frame"
            aria-label={`${visual?.title ?? alt ?? visualId}, visual ${visualPosition} of ${visualTotal}`}
            aria-describedby={contextId}
          >
            <header className="visual-learning-header">
              <div className="visual-learning-meta" aria-label={`Visual ${visualPosition} of ${visualTotal}`}>
                <span>Visual {visualPosition} of {visualTotal}</span>
                <span>{visualType ? visualTypeLabels[visualType] : 'Interactive visual'}</span>
              </div>
              <p id={contextId}>
                {visualType
                  ? visualInspectionPrompts[visualType]
                  : 'Inspect the visual and connect its selected state to the lesson rule.'}
              </p>
            </header>
            <div className="visual-learning-stage">
              <VisualRenderer visualRef={{ id: visualId, type: 'waveform', dataFile: '' }} altText={alt} />
            </div>
            {alt && (
              <div className="inline-visual-caption">
                <span>Figure</span> {alt}
              </div>
            )}
          </section>
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

      <LessonWorkflow lesson={lesson} />
      
      <div className="lesson-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={(url) => url}>
          {body}
        </ReactMarkdown>
      </div>
      
      <footer className="lesson-footer">
        <LessonRetentionPanel lesson={lesson} />
        
        {lesson.checklistIds && lesson.checklistIds.length > 0 && (
          <div className="resource-section">
            {lesson.checklistIds.map(id => {
              const cl = getChecklistById(id);
              return cl ? <ChecklistViewer key={id} checklist={cl} /> : <div key={id}>Checklist missing: {id}</div>;
            })}
          </div>
        )}
        
        {diagnosticLabs.length > 0 && (
          <section className="resource-section applied-dv-section" aria-labelledby={`${lesson.id}-applied-dv-title`}>
            <div className="applied-dv-heading">
              <span>Phase V4</span>
              <div>
                <h2 id={`${lesson.id}-applied-dv-title`}>Applied DV practice</h2>
                <p>Locate the first decisive edge, assign protocol ownership, then choose the evidence a checker must retain.</p>
              </div>
            </div>
            {diagnosticLabs.map(({ id, exercise }) => (
              exercise?.type === 'diagnostic-lab'
                ? <InteractiveExercise key={id} exercise={exercise} />
                : null
            ))}
          </section>
        )}

        {reviewExercises.length > 0 && (
          <section className="resource-section">
            <h2>Check your understanding</h2>
            {reviewExercises.map(({ id, exercise }) => (
              exercise ? <InteractiveExercise key={id} exercise={exercise} /> : null
            ))}
          </section>
        )}

        {missingExercises.map(({ id }) => (
          <div className="resource-section" key={id}>Exercise missing: {id}</div>
        ))}

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
