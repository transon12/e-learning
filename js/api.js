// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('token');
}

// Helper function to check if user is logged in
function isAuthenticated() {
    return !!getAuthToken();
}

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                removeAuthToken();
                window.location.href = 'login.html';
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTH API ====================

// Register user
async function register(userData) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// Login user
async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (data.success && data.token) {
        setAuthToken(data.token);
    }
    
    return data;
}

// Logout user
function logout() {
    removeAuthToken();
    window.location.href = 'index.html';
}

// Get current user
async function getCurrentUser() {
    return apiRequest('/auth/me');
}

// ==================== COURSES API ====================

// Get all courses
async function getCourses(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/courses${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
}

// Get single course
async function getCourse(courseId) {
    return apiRequest(`/courses/${courseId}`);
}

// Create course (Instructor/Admin only)
async function createCourse(courseData) {
    return apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
    });
}

// Update course (Instructor/Admin only)
async function updateCourse(courseId, courseData) {
    return apiRequest(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
    });
}

// Delete course (Instructor/Admin only)
async function deleteCourse(courseId) {
    return apiRequest(`/courses/${courseId}`, {
        method: 'DELETE'
    });
}

// ==================== LESSONS API ====================

// Get lessons for a course
async function getCourseLessons(courseId) {
    return apiRequest(`/lessons/course/${courseId}`);
}

// Get single lesson
async function getLesson(lessonId) {
    return apiRequest(`/lessons/${lessonId}`);
}

// Create lesson (Instructor/Admin only)
async function createLesson(lessonData) {
    return apiRequest('/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
}

// Update lesson (Instructor/Admin only)
async function updateLesson(lessonId, lessonData) {
    return apiRequest(`/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(lessonData)
    });
}

// ==================== ENROLLMENTS API ====================

// Enroll in a course
async function enrollCourse(courseId) {
    return apiRequest(`/enrollments/${courseId}`, {
        method: 'POST'
    });
}

// Mark lesson as completed
async function completeLesson(courseId, lessonId) {
    return apiRequest(`/enrollments/${courseId}/complete-lesson/${lessonId}`, {
        method: 'POST'
    });
}

// Get course progress
async function getCourseProgress(courseId) {
    return apiRequest(`/enrollments/${courseId}/progress`);
}

// ==================== USERS API ====================

// Get user profile
async function getUserProfile() {
    return apiRequest('/users/profile');
}

// Update user profile
async function updateUserProfile(profileData) {
    return apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
}

// Get enrolled courses
async function getEnrolledCourses() {
    return apiRequest('/users/enrolled-courses');
}

// ==================== UPLOAD API ====================

// Upload video file
async function uploadVideo(lessonId, file) {
    const formData = new FormData();
    formData.append('video', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/lesson/${lessonId}/video`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = 'login.html';
        }
        throw new Error(data.message || 'Upload failed');
    }
    
    return data;
}

// Upload audio file
async function uploadAudio(lessonId, file) {
    const formData = new FormData();
    formData.append('audio', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/lesson/${lessonId}/audio`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = 'login.html';
        }
        throw new Error(data.message || 'Upload failed');
    }
    
    return data;
}

// Upload PDF file
async function uploadPDF(lessonId, file) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/lesson/${lessonId}/pdf`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = 'login.html';
        }
        throw new Error(data.message || 'Upload failed');
    }
    
    return data;
}

// Upload multiple files
async function uploadMultipleFiles(lessonId, files) {
    const formData = new FormData();
    if (files.video) formData.append('video', files.video);
    if (files.audio) formData.append('audio', files.audio);
    if (files.pdf) formData.append('pdf', files.pdf);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/lesson/${lessonId}/multiple`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = 'login.html';
        }
        throw new Error(data.message || 'Upload failed');
    }
    
    return data;
}

// Delete uploaded file
async function deleteFile(lessonId, fileType) {
    return apiRequest(`/upload/lesson/${lessonId}/file/${fileType}`, {
        method: 'DELETE'
    });
}

// ==================== ADMIN API ====================

// Get admin statistics
async function getAdminStats() {
    return apiRequest('/admin/stats');
}

// Get all users (Admin only)
async function getAllUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/admin/users${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
}

// Toggle user status (Admin only)
async function toggleUserStatus(userId) {
    return apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT'
    });
}

// Export all functions
window.API = {
    // Auth
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getAuthToken,
    
    // Courses
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Lessons
    getCourseLessons,
    getLesson,
    createLesson,
    updateLesson,
    
    // Enrollments
    enrollCourse,
    completeLesson,
    getCourseProgress,
    
    // Users
    getUserProfile,
    updateUserProfile,
    getEnrolledCourses,
    
    // Upload
    uploadVideo,
    uploadAudio,
    uploadPDF,
    uploadMultipleFiles,
    deleteFile,
    
    // Admin
    getAdminStats,
    getAllUsers,
    toggleUserStatus
};

