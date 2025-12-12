/**
 * Ví dụ các cách thêm dữ liệu vào bảng section_lessons
 */

const { SectionLesson, CourseSection, Lesson } = require('../models');

// ============================================
// CÁCH 1: Dùng Sequelize Model trực tiếp
// ============================================
async function addSectionLessonDirect(sectionId, lessonId, orderIndex = 0) {
    try {
        const sectionLesson = await SectionLesson.create({
            section_id: sectionId,
            lesson_id: lessonId,
            order_index: orderIndex
        });
        console.log('✅ Đã thêm vào section_lessons:', sectionLesson);
        return sectionLesson;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('⚠️ Liên kết đã tồn tại, cập nhật order_index...');
            // Nếu đã tồn tại, cập nhật order_index
            await SectionLesson.update(
                { order_index: orderIndex },
                { where: { section_id: sectionId, lesson_id: lessonId } }
            );
            return await SectionLesson.findOne({
                where: { section_id: sectionId, lesson_id: lessonId }
            });
        }
        throw error;
    }
}

// ============================================
// CÁCH 2: Dùng Sequelize Associations (belongsToMany)
// ============================================
async function addSectionLessonUsingAssociation(sectionId, lessonId, orderIndex = 0) {
    try {
        const section = await CourseSection.findByPk(sectionId);
        const lesson = await Lesson.findByPk(lessonId);

        if (!section || !lesson) {
            throw new Error('Section hoặc Lesson không tồn tại');
        }

        // Thêm lesson vào section với order_index
        await section.addLesson(lesson, {
            through: { order_index: orderIndex }
        });

        console.log('✅ Đã thêm lesson vào section qua association');
        return true;
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    }
}

// ============================================
// CÁCH 3: Thêm nhiều lessons vào một section
// ============================================
async function addMultipleLessonsToSection(sectionId, lessonIds, startOrderIndex = 0) {
    try {
        const section = await CourseSection.findByPk(sectionId);
        if (!section) {
            throw new Error('Section không tồn tại');
        }

        // Tạo mảng lessons với order_index
        const lessonsWithOrder = lessonIds.map((lessonId, index) => ({
            id: lessonId,
            SectionLesson: { order_index: startOrderIndex + index }
        }));

        await section.setLessons(lessonsWithOrder);
        console.log(`✅ Đã thêm ${lessonIds.length} lessons vào section`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    }
}

// ============================================
// CÁCH 4: Dùng SQL trực tiếp (raw query)
// ============================================
async function addSectionLessonRaw(sectionId, lessonId, orderIndex = 0) {
    const { sequelize } = require('../config/database');
    
    try {
        const [results] = await sequelize.query(
            `INSERT INTO section_lessons (section_id, lesson_id, order_index) 
             VALUES (:sectionId, :lessonId, :orderIndex)
             ON DUPLICATE KEY UPDATE order_index = :orderIndex`,
            {
                replacements: { sectionId, lessonId, orderIndex }
            }
        );
        console.log('✅ Đã thêm qua raw SQL');
        return results;
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    }
}

// ============================================
// CÁCH 5: Thêm vào nhiều sections cùng lúc
// ============================================
async function addLessonToMultipleSections(lessonId, sectionIds, orderIndex = 0) {
    try {
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) {
            throw new Error('Lesson không tồn tại');
        }

        // Thêm lesson vào nhiều sections
        for (const sectionId of sectionIds) {
            await SectionLesson.findOrCreate({
                where: { section_id: sectionId, lesson_id: lessonId },
                defaults: { order_index: orderIndex }
            });
        }

        console.log(`✅ Đã thêm lesson vào ${sectionIds.length} sections`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    }
}

// ============================================
// VÍ DỤ SỬ DỤNG
// ============================================
async function example() {
    try {
        // Ví dụ 1: Thêm lesson ID 1 vào section ID 1 với order_index = 1
        await addSectionLessonDirect(1, 1, 1);

        // Ví dụ 2: Thêm lesson ID 2 vào section ID 1 với order_index = 2
        await addSectionLessonUsingAssociation(1, 2, 2);

        // Ví dụ 3: Thêm nhiều lessons [3, 4, 5] vào section ID 2
        await addMultipleLessonsToSection(2, [3, 4, 5], 1);

        // Ví dụ 4: Thêm lesson ID 6 vào nhiều sections [1, 2, 3]
        await addLessonToMultipleSections(6, [1, 2, 3], 0);

    } catch (error) {
        console.error('Lỗi khi chạy ví dụ:', error);
    }
}

// Export các functions
module.exports = {
    addSectionLessonDirect,
    addSectionLessonUsingAssociation,
    addMultipleLessonsToSection,
    addSectionLessonRaw,
    addLessonToMultipleSections
};

// Chạy ví dụ nếu file được gọi trực tiếp
if (require.main === module) {
    example();
}

