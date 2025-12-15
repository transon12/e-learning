const { getFileUrl } = require('../services/s3Service');

/**
 * Format file URLs in course data
 * @param {Object} course - Course object
 * @returns {Object} Course with formatted URLs
 */
function formatCourseUrls(course) {
    if (!course) return course;
    
    const courseData = course.toJSON ? course.toJSON() : course;
    
    // Format thumbnail
    if (courseData.thumbnail) {
        courseData.thumbnail = getFileUrl(courseData.thumbnail);
    }
    
    return courseData;
}

/**
 * Format file URLs in lesson data
 * @param {Object} lesson - Lesson object
 * @returns {Object} Lesson with formatted URLs
 */
function formatLessonUrls(lesson) {
    if (!lesson) return lesson;
    
    const lessonData = lesson.toJSON ? lesson.toJSON() : lesson;
    
    // Format video URL
    if (lessonData.videoUrl) {
        lessonData.videoUrl = getFileUrl(lessonData.videoUrl);
    }
    
    // Format file paths
    if (lessonData.file_video_path) {
        lessonData.file_video_path = getFileUrl(lessonData.file_video_path);
    }
    
    if (lessonData.file_audio_path) {
        lessonData.file_audio_path = getFileUrl(lessonData.file_audio_path);
    }
    
    if (lessonData.file_pdf_path) {
        lessonData.file_pdf_path = getFileUrl(lessonData.file_pdf_path);
    }
    
    return lessonData;
}

/**
 * Format file URLs in array of courses
 * @param {Array} courses - Array of course objects
 * @returns {Array} Courses with formatted URLs
 */
function formatCoursesUrls(courses) {
    if (!Array.isArray(courses)) return courses;
    return courses.map(formatCourseUrls);
}

/**
 * Format file URLs in array of lessons
 * @param {Array} lessons - Array of lesson objects
 * @returns {Array} Lessons with formatted URLs
 */
function formatLessonsUrls(lessons) {
    if (!Array.isArray(lessons)) return lessons;
    return lessons.map(formatLessonUrls);
}

/**
 * Format nested data (courses with sections and lessons)
 * @param {Object} course - Course with nested sections and lessons
 * @returns {Object} Formatted course
 */
function formatNestedCourseUrls(course) {
    if (!course) return course;
    
    const courseData = formatCourseUrls(course);
    
    // Format sections and nested lessons
    if (courseData.sections && Array.isArray(courseData.sections)) {
        courseData.sections = courseData.sections.map(section => {
            const sectionData = section.toJSON ? section.toJSON() : section;
            
            if (sectionData.lessons && Array.isArray(sectionData.lessons)) {
                sectionData.lessons = formatLessonsUrls(sectionData.lessons);
            }
            
            return sectionData;
        });
    }
    
    return courseData;
}

module.exports = {
    formatCourseUrls,
    formatLessonUrls,
    formatCoursesUrls,
    formatLessonsUrls,
    formatNestedCourseUrls
};

