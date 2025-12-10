<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h2 class="mb-4" style="color: #fb873f;">
          <i class="fa fa-upload me-2"></i>Upload Files cho Bài Học
        </h2>

        <!-- Lesson Selection -->
        <div class="card mb-4">
          <div class="card-body">
            <label class="form-label">Chọn Bài Học</label>
            <select v-model="selectedLessonId" class="form-select" @change="loadLessonFiles">
              <option value="">-- Chọn bài học --</option>
              <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                {{ lesson.title }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="selectedLessonId">
          <!-- Upload Video -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="fa fa-video me-2"></i>Upload Video (MP4)</h5>
            </div>
            <div class="card-body">
              <div 
                class="upload-area"
                :class="{ dragover: isDraggingVideo }"
                @dragover.prevent="isDraggingVideo = true"
                @dragleave="isDraggingVideo = false"
                @drop.prevent="handleDrop($event, 'video')"
                @click="triggerFileInput('video')"
              >
                <input 
                  ref="videoInput"
                  type="file" 
                  accept="video/mp4,video/*" 
                  style="display: none"
                  @change="handleFileSelect($event, 'video')"
                >
                <i class="fa fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                <p class="mb-0">Kéo thả file video vào đây hoặc click để chọn</p>
                <small class="text-muted">Chỉ chấp nhận file MP4</small>
              </div>
              <div v-if="uploadingVideo" class="mt-3">
                <div class="progress">
                  <div 
                    class="progress-bar progress-bar-striped progress-bar-animated" 
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{ uploadProgress }}%</small>
              </div>
              <div v-if="lessonFiles.video" class="file-preview mt-3">
                <div class="file-item">
                  <i class="fa fa-video file-icon text-danger"></i>
                  <div class="file-info">
                    <div class="fw-bold">{{ lessonFiles.video.filename }}</div>
                    <div class="file-size">{{ formatFileSize(lessonFiles.video.size) }}</div>
                  </div>
                  <button class="btn btn-sm btn-danger" @click="deleteFile('video')">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Audio -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="fa fa-headphones me-2"></i>Upload Audio (MP3)</h5>
            </div>
            <div class="card-body">
              <div 
                class="upload-area"
                :class="{ dragover: isDraggingAudio }"
                @dragover.prevent="isDraggingAudio = true"
                @dragleave="isDraggingAudio = false"
                @drop.prevent="handleDrop($event, 'audio')"
                @click="triggerFileInput('audio')"
              >
                <input 
                  ref="audioInput"
                  type="file" 
                  accept="audio/mp3,audio/*" 
                  style="display: none"
                  @change="handleFileSelect($event, 'audio')"
                >
                <i class="fa fa-cloud-upload-alt fa-3x text-success mb-3"></i>
                <p class="mb-0">Kéo thả file audio vào đây hoặc click để chọn</p>
                <small class="text-muted">Chỉ chấp nhận file MP3</small>
              </div>
              <div v-if="uploadingAudio" class="mt-3">
                <div class="progress">
                  <div 
                    class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{ uploadProgress }}%</small>
              </div>
              <div v-if="lessonFiles.audio" class="file-preview mt-3">
                <div class="file-item">
                  <i class="fa fa-headphones file-icon text-success"></i>
                  <div class="file-info">
                    <div class="fw-bold">{{ lessonFiles.audio.filename }}</div>
                    <div class="file-size">{{ formatFileSize(lessonFiles.audio.size) }}</div>
                  </div>
                  <button class="btn btn-sm btn-danger" @click="deleteFile('audio')">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload PDF -->
          <div class="card mb-4">
            <div class="card-header bg-danger text-white">
              <h5 class="mb-0"><i class="fa fa-file-pdf me-2"></i>Upload PDF</h5>
            </div>
            <div class="card-body">
              <div 
                class="upload-area"
                :class="{ dragover: isDraggingPdf }"
                @dragover.prevent="isDraggingPdf = true"
                @dragleave="isDraggingPdf = false"
                @drop.prevent="handleDrop($event, 'pdf')"
                @click="triggerFileInput('pdf')"
              >
                <input 
                  ref="pdfInput"
                  type="file" 
                  accept="application/pdf" 
                  style="display: none"
                  @change="handleFileSelect($event, 'pdf')"
                >
                <i class="fa fa-cloud-upload-alt fa-3x text-danger mb-3"></i>
                <p class="mb-0">Kéo thả file PDF vào đây hoặc click để chọn</p>
                <small class="text-muted">Chỉ chấp nhận file PDF</small>
              </div>
              <div v-if="uploadingPdf" class="mt-3">
                <div class="progress">
                  <div 
                    class="progress-bar progress-bar-striped progress-bar-animated bg-danger" 
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{ uploadProgress }}%</small>
              </div>
              <div v-if="lessonFiles.pdf" class="file-preview mt-3">
                <div class="file-item">
                  <i class="fa fa-file-pdf file-icon text-danger"></i>
                  <div class="file-info">
                    <div class="fw-bold">{{ lessonFiles.pdf.filename }}</div>
                    <div class="file-size">{{ formatFileSize(lessonFiles.pdf.size) }}</div>
                  </div>
                  <button class="btn btn-sm btn-danger" @click="deleteFile('pdf')">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const selectedLessonId = ref(route.params.lessonId || '')
const lessons = ref([])
const lessonFiles = ref({})
const isDraggingVideo = ref(false)
const isDraggingAudio = ref(false)
const isDraggingPdf = ref(false)
const uploadingVideo = ref(false)
const uploadingAudio = ref(false)
const uploadingPdf = ref(false)
const uploadProgress = ref(0)

const videoInput = ref(null)
const audioInput = ref(null)
const pdfInput = ref(null)

onMounted(async () => {
  await loadLessons()
  if (selectedLessonId.value) {
    await loadLessonFiles()
  }
})

watch(() => route.params.lessonId, (newId) => {
  if (newId) {
    selectedLessonId.value = newId
    loadLessonFiles()
  }
})

const loadLessons = async () => {
  try {
    // Load all courses first, then get lessons
    const coursesResponse = await api.get('/courses', { params: { limit: 1000 } })
    const courses = coursesResponse.data.data || []
    
    // Get lessons from all courses
    for (const course of courses) {
      try {
        const lessonsResponse = await api.get(`/lessons/course/${course.id}`)
        if (lessonsResponse.data.data) {
          lessonsResponse.data.data.forEach(section => {
            section.lessons.forEach(lesson => {
              lessons.value.push({
                ...lesson,
                courseTitle: course.title
              })
            })
          })
        }
      } catch (error) {
        console.error(`Error loading lessons for course ${course.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error loading lessons:', error)
  }
}

const loadLessonFiles = async () => {
  if (!selectedLessonId.value) return

  try {
    const response = await api.get(`/lessons/${selectedLessonId.value}`)
    const lesson = response.data.data
    
    lessonFiles.value = {
      video: lesson.file_video_path ? {
        filename: lesson.file_video_filename,
        size: lesson.file_video_size,
        path: lesson.file_video_path
      } : null,
      audio: lesson.file_audio_path ? {
        filename: lesson.file_audio_filename,
        size: lesson.file_audio_size,
        path: lesson.file_audio_path
      } : null,
      pdf: lesson.file_pdf_path ? {
        filename: lesson.file_pdf_filename,
        size: lesson.file_pdf_size,
        path: lesson.file_pdf_path
      } : null
    }
  } catch (error) {
    console.error('Error loading lesson files:', error)
  }
}

const triggerFileInput = (type) => {
  if (type === 'video') videoInput.value?.click()
  else if (type === 'audio') audioInput.value?.click()
  else if (type === 'pdf') pdfInput.value?.click()
}

const handleDrop = (event, type) => {
  isDraggingVideo.value = false
  isDraggingAudio.value = false
  isDraggingPdf.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    uploadFile(files[0], type)
  }
}

const handleFileSelect = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file, type)
  }
}

const uploadFile = async (file, type) => {
  if (!selectedLessonId.value) {
    alert('Vui lòng chọn bài học trước!')
    return
  }

  const formData = new FormData()
  formData.append(type, file)

  try {
    if (type === 'video') uploadingVideo.value = true
    else if (type === 'audio') uploadingAudio.value = true
    else if (type === 'pdf') uploadingPdf.value = true

    uploadProgress.value = 0

    const response = await api.post(
      `/upload/lesson/${selectedLessonId.value}/${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
        }
      }
    )

    if (response.data.success) {
      alert(`Upload ${type} thành công!`)
      await loadLessonFiles()
    }
  } catch (error) {
    alert('Lỗi upload: ' + (error.response?.data?.message || error.message))
  } finally {
    uploadingVideo.value = false
    uploadingAudio.value = false
    uploadingPdf.value = false
    uploadProgress.value = 0
  }
}

const deleteFile = async (type) => {
  if (!confirm(`Bạn có chắc muốn xóa file ${type}?`)) return

  try {
    await api.delete(`/upload/lesson/${selectedLessonId.value}/file/${type}`)
    alert('Xóa file thành công!')
    await loadLessonFiles()
  } catch (error) {
    alert('Lỗi xóa file: ' + (error.response?.data?.message || error.message))
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #fb873f;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  background: #fff5f0;
  border-color: #fb873f;
}

.upload-area.dragover {
  background: #fff5f0;
  border-color: #fb873f;
  transform: scale(1.02);
}

.file-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin: 10px 0;
  background: white;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.file-icon {
  font-size: 24px;
  margin-right: 15px;
}

.file-info {
  flex: 1;
}

.file-size {
  color: #6c757d;
  font-size: 12px;
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
}
</style>

