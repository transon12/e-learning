<template>
  <div>
    <div class="content-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">Tin nhắn từ Liên hệ</h5>
        <div>
          <select v-model="statusFilter" class="form-select form-select-sm d-inline-block me-2" style="width: auto;" @change="loadMessages">
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="read">Đã đọc</option>
            <option value="replied">Đã trả lời</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <input 
            v-model="searchTerm" 
            type="text" 
            class="form-control form-control-sm d-inline-block" 
            style="width: 250px;" 
            placeholder="Tìm kiếm..."
            @input="loadMessages"
          >
          <button class="btn btn-primary btn-sm ms-2" @click="loadMessages">
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người gửi</th>
                <th>Email</th>
                <th>Tiêu đề</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="message in messages" :key="message.id">
                <td>{{ message.id }}</td>
                <td>
                  <div class="fw-bold">{{ message.name }}</div>
                  <small class="text-muted" v-if="message.phone">{{ message.phone }}</small>
                </td>
                <td>{{ message.email }}</td>
                <td>
                  <div class="text-truncate" style="max-width: 200px;" :title="message.subject">
                    {{ message.subject }}
                  </div>
                </td>
                <td>{{ formatDate(message.created_at || message.createdAt) }}</td>
                <td>
                  <span :class="getStatusBadgeClass(message.status)">
                    {{ getStatusLabel(message.status) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="viewMessage(message)"
                    title="Xem chi tiết"
                  >
                    <i class="fa fa-eye"></i>
                  </button>
                  <button 
                    v-if="message.status !== 'replied'"
                    class="btn btn-sm btn-outline-success me-1" 
                    @click="showReplyModal(message)"
                    title="Trả lời"
                  >
                    <i class="fa fa-reply"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-warning" 
                    @click="updateStatus(message, 'archived')"
                    title="Lưu trữ"
                    v-if="message.status !== 'archived'"
                  >
                    <i class="fa fa-archive"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-info" 
                    @click="updateStatus(message, 'read')"
                    title="Khôi phục"
                    v-else
                  >
                    <i class="fa fa-undo"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="messages.length === 0" class="text-center text-muted py-5">
          Không có tin nhắn nào
        </div>

        <!-- Pagination -->
        <nav v-if="pagination.pages > 1" class="mt-4">
          <div class="mb-2 text-muted text-center">
            Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} trong tổng số {{ pagination.total }} tin nhắn
          </div>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.page === 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(pagination.page - 1)">Trước</a>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.page, disabled: page === '...' }">
              <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              <span v-else class="page-link">{{ page }}</span>
            </li>
            <li class="page-item" :class="{ disabled: pagination.page === pagination.pages }">
              <a class="page-link" href="#" @click.prevent="goToPage(pagination.page + 1)">Sau</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- View Message Modal -->
    <div class="modal fade" id="viewMessageModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết Tin nhắn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedMessage">
              <div class="mb-3">
                <strong>Người gửi:</strong> {{ selectedMessage.name }}
              </div>
              <div class="mb-3">
                <strong>Email:</strong> {{ selectedMessage.email }}
              </div>
              <div class="mb-3" v-if="selectedMessage.phone">
                <strong>Số điện thoại:</strong> {{ selectedMessage.phone }}
              </div>
              <div class="mb-3">
                <strong>Tiêu đề:</strong> {{ selectedMessage.subject }}
              </div>
              <div class="mb-3">
                <strong>Nội dung:</strong>
                <div class="border p-3 mt-2 rounded bg-light">
                  {{ selectedMessage.message }}
                </div>
              </div>
              <div class="mb-3">
                <strong>Ngày gửi:</strong> {{ formatDate(selectedMessage.created_at || selectedMessage.createdAt) }}
              </div>
              <div class="mb-3" v-if="selectedMessage.reply_message || selectedMessage.replyMessage">
                <strong>Phản hồi:</strong>
                <div class="border p-3 mt-2 rounded bg-info bg-opacity-10">
                  {{ selectedMessage.reply_message || selectedMessage.replyMessage }}
                </div>
                <small class="text-muted">
                  Trả lời bởi: {{ (selectedMessage.replied_by_user || selectedMessage.repliedByUser)?.username || 'Admin' }} 
                  vào {{ formatDate(selectedMessage.replied_at || selectedMessage.repliedAt) }}
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button 
              v-if="selectedMessage && selectedMessage.status !== 'replied'"
              type="button" 
              class="btn btn-primary" 
              @click="showReplyModal(selectedMessage)"
            >
              Trả lời
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reply Modal -->
    <div class="modal fade" id="replyModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Trả lời Tin nhắn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="messageToReply" class="mb-3">
              <strong>Gửi đến:</strong> {{ messageToReply.email }}<br>
              <strong>Tiêu đề:</strong> {{ messageToReply.subject }}
            </div>
            <form @submit.prevent="sendReply">
              <div class="mb-3">
                <label class="form-label">Nội dung phản hồi *</label>
                <textarea 
                  v-model="replyForm.replyMessage" 
                  class="form-control" 
                  rows="6"
                  required
                  placeholder="Nhập nội dung phản hồi..."
                ></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="replying">
                  <span v-if="replying" class="spinner-border spinner-border-sm me-2"></span>
                  {{ replying ? 'Đang gửi...' : 'Gửi Phản hồi' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const loading = ref(false)
const replying = ref(false)
const messages = ref([])
const searchTerm = ref('')
const statusFilter = ref('')
const selectedMessage = ref(null)
const messageToReply = ref(null)

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})

const replyForm = ref({
  replyMessage: ''
})

let viewMessageModal = null
let replyModal = null

onMounted(() => {
  loadMessages()
  
  // Initialize modals
  viewMessageModal = new Modal(document.getElementById('viewMessageModal'))
  replyModal = new Modal(document.getElementById('replyModal'))
})

const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.pages
  const current = pagination.value.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 3; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const loadMessages = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (searchTerm.value) {
      params.search = searchTerm.value
    }
    
    const response = await api.get('/contact/messages', { params })
    messages.value = response.data.data || []
    pagination.value.total = response.data.total || 0
    pagination.value.pages = Math.ceil(pagination.value.total / pagination.value.limit)
  } catch (error) {
    console.error('Error loading messages:', error)
    alert('Lỗi khi tải danh sách tin nhắn')
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    loadMessages()
  }
}

const viewMessage = async (message) => {
  try {
    const response = await api.get(`/contact/messages/${message.id}`)
    selectedMessage.value = response.data.data
    viewMessageModal.show()
  } catch (error) {
    console.error('Error loading message:', error)
    alert('Lỗi khi tải chi tiết tin nhắn')
  }
}

const showReplyModal = (message) => {
  messageToReply.value = message
  replyForm.value.replyMessage = ''
  replyModal.show()
}

const sendReply = async () => {
  if (!messageToReply.value) return
  
  replying.value = true
  try {
    await api.put(`/contact/messages/${messageToReply.value.id}/reply`, {
      replyMessage: replyForm.value.replyMessage
    })
    alert('Gửi phản hồi thành công!')
    replyModal.hide()
    loadMessages()
    if (selectedMessage.value && selectedMessage.value.id === messageToReply.value.id) {
      viewMessage(messageToReply.value)
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Lỗi khi gửi phản hồi')
  } finally {
    replying.value = false
  }
}

const updateStatus = async (message, status) => {
  try {
    await api.put(`/contact/messages/${message.id}/status`, { status })
    alert('Cập nhật trạng thái thành công!')
    loadMessages()
    if (selectedMessage.value && selectedMessage.value.id === message.id) {
      selectedMessage.value.status = status
    }
  } catch (error) {
    alert('Lỗi khi cập nhật trạng thái')
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'new': 'badge bg-primary',
    'read': 'badge bg-info',
    'replied': 'badge bg-success',
    'archived': 'badge bg-secondary'
  }
  return classes[status] || 'badge bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    'new': 'Mới',
    'read': 'Đã đọc',
    'replied': 'Đã trả lời',
    'archived': 'Đã lưu trữ'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.content-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>

