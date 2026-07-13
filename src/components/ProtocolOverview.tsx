import { Link } from 'react-router-dom';
import { getLessons } from '../lib/loaders';
import type { Lesson } from '../types/content';
import './ProtocolOverview.css';

type Protocol = Lesson['protocol'];

interface ProtocolOverviewProps {
  protocol: Protocol;
  label: string;
  title: string;
  description: string;
  focus: string;
}

const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function ProtocolOverview({ protocol, label, title, description, focus }: ProtocolOverviewProps) {
  const lessons = getLessons()
    .map(({ lesson }) => lesson)
    .filter(lesson => lesson.protocol === protocol)
    .sort((a, b) => a.order - b.order);

  const grouped = levelOrder
    .map(level => ({ level, lessons: lessons.filter(lesson => lesson.level === level) }))
    .filter(group => group.lessons.length > 0);

  return (
    <div className={`protocol-page protocol-page-${protocol}`}>
      <header className="protocol-hero">
        <div>
          <span className="protocol-code">{label}</span>
          <h1><span className="visually-hidden">{label}: </span>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="protocol-hero-meta">
          <strong>{lessons.length}</strong>
          <span>lessons</span>
          <small>{focus}</small>
        </div>
      </header>

      <nav className="level-jump-nav" aria-label={`${label} lesson levels`}>
        {grouped.map(group => (
          <a key={group.level} href={`#${protocol}-${group.level}`}>
            <span>{group.level}</span>
            <strong>{group.lessons.length}</strong>
          </a>
        ))}
      </nav>

      <div className="protocol-curriculum">
        {grouped.map(group => (
          <section key={group.level} id={`${protocol}-${group.level}`} className="curriculum-level">
            <header>
              <h2>{group.level}</h2>
              <span>{group.lessons.length} lesson{group.lessons.length === 1 ? '' : 's'}</span>
            </header>
            <div className="curriculum-index">
              {group.lessons.map(lesson => (
                <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="curriculum-index-row">
                  <span className="curriculum-order">{String(lesson.order).padStart(2, '0')}</span>
                  <span className="curriculum-row-copy">
                    <strong>{lesson.title}</strong>
                    <span>{lesson.summary}</span>
                  </span>
                  <span className="curriculum-row-visuals">
                    {lesson.visualIds.length > 0 ? `${lesson.visualIds.length} visual${lesson.visualIds.length === 1 ? '' : 's'}` : 'Reading'}
                  </span>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
