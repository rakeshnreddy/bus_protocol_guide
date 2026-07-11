import { useParams } from 'react-router-dom';
import LessonRenderer from '../components/LessonRenderer';
import { getLessons } from '../lib/loaders';

export default function LessonPage() {
  const { lessonId } = useParams();
  const allLessons = getLessons();
  
  const lessonData = allLessons.find(l => l.lesson.id === lessonId);
  
  if (!lessonData) {
    return <div>Lesson not found (ID: {lessonId}).</div>;
  }
  
  return <LessonRenderer lesson={lessonData.lesson} body={lessonData.body} />;
}
