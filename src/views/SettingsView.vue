<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountSidebar from '@/modules/account/AccountSidebar.vue'
import AccountPageHeader from '@/modules/account/AccountPageHeader.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import PasswordManager from '@/modules/account/PasswordManager.vue'
import '@/modules/account/account.css'
import '@/modules/account/account-subpage.css'

const authStore = useAuthStore()

const nickname = computed(() => authStore.user?.nickname || '未设置')
const avatar = computed(() => authStore.user?.avatar || '')
const userInitial = computed(
  () => authStore.user?.nickname?.slice(0, 1) || authStore.user?.phone?.slice(-2) || '愿',
)
const maskedPhone = computed(() => {
  const phone = authStore.user?.phone || ''
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '未绑定'
})

const editingNickname = ref(false)
const nicknameDraft = ref('')
const fileInput = ref(null)
const avatarFailed = ref(false)
const saving = ref(false)
const feedback = ref({ type: '', message: '' })

function startEditNickname() {
  nicknameDraft.value = authStore.user?.nickname || ''
  feedback.value = { type: '', message: '' }
  editingNickname.value = true
}

function cancelNickname() {
  editingNickname.value = false
}

async function saveNickname() {
  const value = nicknameDraft.value.trim()
  if (!value) return notify('昵称不能为空', 'error')
  if (value.length > 30) return notify('昵称不能超过 30 个字符', 'error')
  if (value === authStore.user?.nickname) {
    editingNickname.value = false
    return
  }
  await submit({ nickname: value }, () => {
    editingNickname.value = false
  })
}

function chooseAvatar() {
  fileInput.value?.click()
}

async function onAvatarChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!/^image\//.test(file.type)) return notify('请选择图片文件', 'error')
  if (file.size > 10 * 1024 * 1024) return notify('图片不能超过 10MB', 'error')
  await saveAvatar(file)
}

async function saveAvatar(file) {
  if (saving.value) return
  saving.value = true
  feedback.value = { type: '', message: '' }
  try {
    await authStore.uploadAvatar(file)
    avatarFailed.value = false
    feedback.value = { type: 'success', message: '已保存' }
  } catch (error) {
    notify(error.message || '上传失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

async function submit(payload, done) {
  if (saving.value) return
  saving.value = true
  feedback.value = { type: '', message: '' }
  try {
    await authStore.saveProfile(payload)
    feedback.value = { type: 'success', message: '已保存' }
    done()
  } catch (error) {
    notify(error.message || '保存失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

function notify(message, type) {
  feedback.value = { type, message }
}
</script>

<template>
  <div class="wish-account account-subpage">
    <AccountSidebar />
    <main id="account-content" class="account-main" tabindex="-1">
      <AccountPageHeader section="账户设置" />
      <div class="dashboard-content">
        <section class="account-panel settings-panel" aria-labelledby="settings-info-title">
          <header class="panel-heading"><h2 id="settings-info-title">账户信息</h2></header>
          <dl class="settings-list">
            <div class="settings-row settings-row--profile">
              <dt>头像</dt>
              <dd>
                <button
                  class="profile-avatar profile-avatar--button"
                  type="button"
                  :disabled="saving"
                  aria-label="更换头像"
                  @click="chooseAvatar"
                >
                  <img v-if="avatar && !avatarFailed" :src="avatar" alt="" @error="avatarFailed = true" />
                  <span v-else class="avatar-fallback">{{ userInitial }}</span>
                  <span class="profile-avatar-overlay" aria-hidden="true"><AccountIcon name="camera" /></span>
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="profile-file-input"
                  @change="onAvatarChange"
                />
              </dd>
            </div>
            <div class="settings-row settings-row--profile">
              <dt>昵称</dt>
              <dd>
                <span v-if="editingNickname" class="profile-edit">
                  <input
                    v-model.trim="nicknameDraft"
                    maxlength="30"
                    placeholder="输入昵称"
                    aria-label="昵称"
                    @keyup.enter="saveNickname"
                  />
                  <span class="profile-actions">
                    <button
                      class="settings-action"
                      type="button"
                      :disabled="saving"
                      @click="saveNickname"
                    >
                      保存
                    </button>
                    <button
                      class="settings-action"
                      type="button"
                      :disabled="saving"
                      @click="cancelNickname"
                    >
                      取消
                    </button>
                  </span>
                </span>
                <span v-else class="profile-edit">
                  <button class="profile-value" type="button" @click="startEditNickname">
                    <span>{{ nickname }}</span>
                    <AccountIcon name="pencil" />
                  </button>
                </span>
              </dd>
            </div>
            <div class="settings-row">
              <dt>手机号</dt>
              <dd>{{ maskedPhone }}</dd>
            </div>
          </dl>
          <p v-if="feedback.message" class="settings-feedback" :class="feedback.type" role="status">
            {{ feedback.message }}
          </p>
        </section>

        <PasswordManager />
      </div>
    </main>
  </div>
</template>