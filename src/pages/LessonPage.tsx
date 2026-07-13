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
  
  const protocolLessons = allLessons
    .filter(item => item.lesson.protocol === lessonData.lesson.protocol)
    .sort((a, b) => a.lesson.order - b.lesson.order);
  const currentIndex = protocolLessons.findIndex(item => item.lesson.id === lessonData.lesson.id);

  return (
    <LessonRenderer
      lesson={lessonData.lesson}
      body={lessonData.body}
      navigation={{
        current: currentIndex + 1,
        total: protocolLessons.length,
        previous: currentIndex > 0 ? protocolLessons[currentIndex - 1].lesson : undefined,
        next: currentIndex < protocolLessons.length - 1 ? protocolLessons[currentIndex + 1].lesson : undefined,
      }}
    />
  );
}
