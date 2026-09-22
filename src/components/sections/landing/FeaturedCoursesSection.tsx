import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import ScrollFloat from '@/components/ui/ScrollFloat';

interface CourseData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  durationHours: number;
  modules: Array<unknown>;
  labs: Array<unknown>;
  mentor?: {
    title: string;
    user: {
      name: string;
    };
  } | null;
}

interface FeaturedCoursesSectionProps {
  courses: CourseData[];
}

export function FeaturedCoursesSection({ courses }: FeaturedCoursesSectionProps) {
  return (
    <section id="featured-courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="flex flex-col items-start">
            <span className="text-sm sm:text-base md:text-lg font-medium tracking-[0.2em] sm:tracking-[0.25em] text-black uppercase font-sans">
              CURATED PROGRAMMES
            </span>
            <div className="h-1 w-16 sm:w-20 mt-2.5 mb-6 rounded-full bg-violet-600 shadow-[0_0_12px_rgba(126,59,237,0.5)]" />
            <ScrollFloat
              as="h2"
              animationDuration={0.8}
              ease="back.inOut(2)"
              scrollStart="top bottom-=15%"
              scrollEnd="bottom center"
              stagger={0.02}
              containerClassName="text-left"
              textClassName="tse-h2 text-black font-sans "
            >
              Featured Cybersecurity Courses
            </ScrollFloat>
          </div>
          <Link href="/courses" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2 font-medium border-black/20 hover:bg-black/5">
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between border-black/10 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="font-mono text-xs font-medium">{course.category}</Badge>
                  <Badge variant="outline" className="text-xs font-medium">{course.level}</Badge>
                </div>
                <CardTitle className="text-lg hover:text-security-green-dark transition-colors font-medium">
                  <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted font-mono pt-4 border-t border-border">
                  <span>{course.durationHours} Hours</span>
                  <span>{course.modules.length} Modules</span>
                  <span>{course.labs.length} Labs</span>
                </div>

                {course.mentor && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-medium text-xs">
                      {course.mentor.user.name[0]}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-primary block">{course.mentor.user.name}</span>
                      <span className="text-muted">{course.mentor.title}</span>
                    </div>
                  </div>
                )}

                <Link href={`/courses/${course.slug}`} className="block pt-2">
                  <Button className="w-full justify-between bg-black text-white hover:bg-gray-800 font-medium">
                    Inspect Curriculum
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
