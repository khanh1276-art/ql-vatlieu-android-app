// ============================================================================
// NATIVE & HYBRID ANDROID EXTENSION FOR KHO VẬT LIỆU CÔNG TRƯỜNG
// Hỗ trợ: Cấu hình Máy Chủ (Render / LAN), Hàng Đợi Ngoại Tuyến (Offline Queue),
//         Rung phản hồi (Haptic), Chụp ảnh phiếu cân (Camera) & Đồng bộ tự động
// ============================================================================

const NativeApp = {
  DEFAULT_SERVER: 'https://ql-vatlieu-congtruong.onrender.com',
  isOnline: navigator.onLine,
  capturedPhotoBase64: null,

  init() {
    this.setupNetworkListeners();
    this.updateServerUI();
    this.updateOfflineBanner();
    this.injectServerModal();
    console.log('📱 [NativeApp] Khởi tạo Android Hybrid Engine thành công. Máy chủ:', this.getServerUrl());
  },

  // 1. Quản lý URL máy chủ (Linh hoạt Render Cloud hoặc IP mạng nội bộ công trường)
  getServerUrl() {
    let url = localStorage.getItem('native_server_url');
    if (!url || !url.trim()) {
      url = this.DEFAULT_SERVER;
    }
    return url.replace(/\/+$/, '');
  },

  setServerUrl(newUrl) {
    let clean = (newUrl || '').trim().replace(/\/+$/, '');
    if (!clean) clean = this.DEFAULT_SERVER;
    localStorage.setItem('native_server_url', clean);
    this.updateServerUI();
    return clean;
  },

  async testConnection(targetUrl) {
    const url = (targetUrl || this.getServerUrl()).replace(/\/+$/, '');
    const startTime = Date.now();
    try {
      const res = await fetch(`${url}/api/auth/me`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      const latency = Date.now() - startTime;
      return { ok: true, status: res.status, latency };
    } catch (err) {
      return { ok: false, error: err.message || 'Không thể kết nối tới máy chủ' };
    }
  },

  updateServerUI() {
    const current = this.getServerUrl();
    const hostname = current.replace(/^https?:\/\//, '');

    const pillText = document.getElementById('serverStatusText');
    if (pillText) {
      pillText.textContent = hostname.length > 25 ? hostname.substring(0, 22) + '...' : hostname;
    }

    const loginLabel = document.getElementById('loginServerLabel');
    if (loginLabel) {
      loginLabel.textContent = `Máy chủ: ${hostname}`;
    }
  },

  // 2. Mạng & Hàng đợi ngoại tuyến (Offline Queue cho công trường mất sóng)
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.vibrateSuccess();
      this.showToast('🟢 Đã có sóng kết nối! Đang tự động kiểm tra phiếu chờ đồng bộ...');
      this.updateOfflineBanner();
      this.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.vibrateError();
      this.showToast('⚠️ Mất kết nối mạng! Ứng dụng đã chuyển sang chế độ Nhập Ngoại Tuyến (Offline).');
      this.updateOfflineBanner();
    });
  },

  getOfflineQueue() {
    try {
      const data = localStorage.getItem('offline_tickets_queue');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTicketToQueue(ticketData) {
    const queue = this.getOfflineQueue();
    ticketData._queuedAt = new Date().toISOString();
    ticketData._localId = 'OFFLINE_' + Date.now();
    queue.push(ticketData);
    localStorage.setItem('offline_tickets_queue', JSON.stringify(queue));
    this.vibrateSuccess();
    this.updateOfflineBanner();
    this.showToast(`💾 Đã lưu phiếu vào máy (${ticketData.plate_number}). Sẽ tự đồng bộ khi có mạng!`);
  },

  updateOfflineBanner() {
    const queue = this.getOfflineQueue();
    let banner = document.getElementById('offlineSyncBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offlineSyncBanner';
      banner.className = 'max-w-7xl mx-auto px-4 mt-2 hidden';
      const main = document.querySelector('main');
      if (main) main.parentNode.insertBefore(banner, main);
    }

    if (queue.length > 0) {
      banner.classList.remove('hidden');
      banner.innerHTML = `
        <div class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 rounded-xl shadow flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center space-x-2">
            <span class="text-base animate-bounce">📦</span>
            <span>Bạn đang có <strong>${queue.length}</strong> phiếu xe ngoại tuyến chưa gửi lên máy chủ!</span>
          </div>
          <button onclick="NativeApp.syncOfflineQueue()" class="px-3 py-1 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-lg shadow-sm transition">
            ĐỒNG BỘ NGAY 🚀
          </button>
        </div>
      `;
    } else {
      banner.classList.add('hidden');
    }
  },

  async syncOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      this.showToast('✅ Toàn bộ phiếu xe đã được đồng bộ lên máy chủ.');
      return;
    }

    this.showToast(`🔄 Đang đồng bộ ${queue.length} phiếu xe lên máy chủ...`);
    const remaining = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${this.getServerUrl()}/api/tickets/checkin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(item),
          signal: AbortSignal.timeout(10000)
        });

        if (res.ok) {
          syncedCount++;
        } else {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    localStorage.setItem('offline_tickets_queue', JSON.stringify(remaining));
    this.updateOfflineBanner();

    if (syncedCount > 0) {
      this.vibrateSuccess();
      this.showToast(`🎉 Đã đồng bộ thành công ${syncedCount} phiếu lên máy chủ!`);
      if (typeof loadInYardTickets === 'function') loadInYardTickets();
      if (typeof loadDashboardStats === 'function') loadDashboardStats();
    }
    if (remaining.length > 0) {
      this.showToast(`⚠️ Còn ${remaining.length} phiếu chưa gửi được do mạng gián đoạn.`);
    }
  },

  // 3. Rung phản hồi (Haptic feedback)
  vibrateSuccess() {
    try {
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    } catch (e) {}
  },

  vibrateError() {
    try {
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
    } catch (e) {}
  },

  // 4. Chụp ảnh phiếu cân / biển số xe
  handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Nén ảnh trực tiếp trên điện thoại để tiết kiệm 3G/4G
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        this.capturedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Hiển thị preview
        const preview = document.getElementById('ticketPhotoPreview');
        const previewImg = document.getElementById('ticketPhotoImg');
        if (preview && previewImg) {
          previewImg.src = this.capturedPhotoBase64;
          preview.classList.remove('hidden');
        }
        this.vibrateSuccess();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  },

  removePhoto() {
    this.capturedPhotoBase64 = null;
    const preview = document.getElementById('ticketPhotoPreview');
    const input = document.getElementById('ticketPhotoInput');
    if (preview) preview.classList.add('hidden');
    if (input) input.value = '';
  },

  // 5. Thông báo nhẹ dạng Toast
  showToast(msg) {
    let container = document.getElementById('nativeToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'nativeToastContainer';
      container.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none w-11/12 max-w-md';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border border-slate-700/80 transition-all transform duration-300 translate-y-2 opacity-0 pointer-events-auto flex items-center justify-between';
    toast.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" class="ml-2 text-slate-400 hover:text-white">✕</button>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 20);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // 6. Giao diện Modal Cấu Hình Máy Chủ Kết Nối
  injectServerModal() {
    if (document.getElementById('serverConfigModal')) return;
    const modal = document.createElement('div');
    modal.id = 'serverConfigModal';
    modal.className = 'fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🌐</span>
            <h3 class="font-bold text-sm">Cấu Hình Kết Nối Máy Chủ (Server)</h3>
          </div>
          <button onclick="NativeApp.closeServerModal()" class="text-blue-200 hover:text-white p-1 rounded-lg">✕</button>
        </div>
        <div class="p-5 space-y-4">
          <p class="text-xs text-slate-600 leading-relaxed">
            Ứng dụng Android chạy độc lập trên điện thoại và gửi/nhận dữ liệu với máy chủ. Bạn có thể chọn máy chủ Render Cloud hoặc nhập IP mạng nội bộ công trường:
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Địa chỉ máy chủ API:</label>
            <input type="url" id="cfgServerUrl" 
              class="w-full text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
              placeholder="https://ql-vatlieu-congtruong.onrender.com">
          </div>

          <div class="flex items-center space-x-2">
            <button type="button" onclick="document.getElementById('cfgServerUrl').value = NativeApp.DEFAULT_SERVER"
              class="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200">
              ☁️ Mặc định Render Cloud
            </button>
            <button type="button" onclick="document.getElementById('cfgServerUrl').value = 'http://192.168.1.100:3000'"
              class="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold border border-slate-300">
              🏢 Mạng LAN Cục bộ
            </button>
          </div>

          <div id="cfgPingResult" class="p-3 rounded-xl text-xs font-semibold hidden"></div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button type="button" onclick="NativeApp.testModalConnection()" 
              class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
              <span>⚡</span> Kiểm Tra Kết Nối
            </button>
            <button type="button" onclick="NativeApp.saveModalConfig()" 
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition">
              💾 Lưu Cài Đặt
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  openServerModal() {
    this.injectServerModal();
    const input = document.getElementById('cfgServerUrl');
    const result = document.getElementById('cfgPingResult');
    if (input) input.value = this.getServerUrl();
    if (result) result.className = 'hidden';
    const modal = document.getElementById('serverConfigModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeServerModal() {
    const modal = document.getElementById('serverConfigModal');
    if (modal) modal.classList.add('hidden');
  },

  async testModalConnection() {
    const input = document.getElementById('cfgServerUrl');
    const result = document.getElementById('cfgPingResult');
    if (!input || !result) return;

    result.className = 'p-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 block';
    result.textContent = '⏳ Đang thử kết nối tới máy chủ...';

    const test = await this.testConnection(input.value);
    if (test.ok) {
      result.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block';
      result.innerHTML = `✅ Kết nối thành công! Độ trễ phản hồi: <strong>${test.latency}ms</strong>`;
      this.vibrateSuccess();
    } else {
      result.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-800 border border-red-200 block';
      result.innerHTML = `❌ Lỗi kết nối: ${test.error}. Hãy kiểm tra lại địa chỉ hoặc mạng!`;
      this.vibrateError();
    }
  },

  saveModalConfig() {
    const input = document.getElementById('cfgServerUrl');
    if (input) {
      this.setServerUrl(input.value);
      this.closeServerModal();
      this.vibrateSuccess();
      this.showToast('✅ Đã lưu cấu hình máy chủ mới!');
    }
  }
};

// Khởi chạy khi DOM sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NativeApp.init());
} else {
  NativeApp.init();
}

window.NativeApp = NativeApp;
